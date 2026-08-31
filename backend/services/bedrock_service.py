import os
import base64
import struct

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

load_dotenv()

AWS_BEARER_TOKEN = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION       = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID         = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")


def _decode_bedrock_api_key(token: str) -> tuple[str, str]:
    """
    Decode a Bedrock inline API key token into (access_key_id, secret_access_key).

    Bedrock API key binary format (base64-encoded):
      [2 bytes big-endian length of key_id][key_id bytes][secret bytes]

    The first byte of the decoded blob may have a non-printable prefix —
    the key_id always starts with 'BedrockAPIKey-'.
    The key_id and secret are separated by ':'.
    """
    decoded = base64.b64decode(token)

    # Locate the colon separator between key_id and secret
    colon_idx = decoded.find(b":")
    if colon_idx == -1:
        raise RuntimeError(
            "AWS_BEARER_TOKEN_BEDROCK format unrecognised — no ':' separator found."
        )

    raw_key_id = decoded[:colon_idx]
    raw_secret = decoded[colon_idx + 1:]

    # Strip any non-printable leading bytes from the key_id
    # (the token carries a 2-byte length prefix before 'BedrockAPIKey-')
    bedrock_marker = b"BedrockAPIKey-"
    marker_idx = raw_key_id.find(bedrock_marker)
    if marker_idx != -1:
        raw_key_id = raw_key_id[marker_idx:]

    access_key_id     = raw_key_id.decode("utf-8")
    secret_access_key = raw_secret.decode("utf-8")
    return access_key_id, secret_access_key


def get_bedrock_client():
    """
    Return a boto3 Bedrock Runtime client authenticated with the
    Bedrock inline API key stored in AWS_BEARER_TOKEN_BEDROCK.
    """
    if not AWS_BEARER_TOKEN:
        raise RuntimeError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Add it to your .env file."
        )

    try:
        access_key_id, secret_access_key = _decode_bedrock_api_key(AWS_BEARER_TOKEN)
    except Exception as exc:
        raise RuntimeError(f"Failed to decode AWS_BEARER_TOKEN_BEDROCK: {exc}") from exc

    return boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
    )


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    """
    Call AWS Bedrock to generate a travel itinerary recommendation.

    Args:
        destination:  The travel destination (e.g. "Bali, Indonesia").
        days:         Number of days for the trip.
        budget:       Total budget in USD.
        travel_style: Travel style (e.g. "Family", "Couple", "Solo").

    Returns:
        The AI-generated itinerary as a plain string.
    """
    prompt = (
        f"You are an experienced travel planner.\n"
        f"Create a structured daily plan for a {days}-day trip to {destination}.\n"
        f"Total budget: USD {budget}\n"
        f"Travel style: {travel_style}\n\n"
        "Return the complete response in Markdown only.\n"
        "Use headers with the format '## Day X: Title' for each day.\n"
        "Under every day, include these exact sections:\n"
        "**Morning:**\n"
        "- Provide 2-3 specific morning activities.\n"
        "**Afternoon:**\n"
        "- Include cultural sites and local experiences.\n"
        "**Evening:**\n"
        "- Include dinner spots and nightlife suggestions.\n\n"
        "Additional required rules:\n"
        "- Format all recommendations as bullet points.\n"
        "- Keep each day practical, geographically sensible, "
        "and aligned with the stated budget and travel style.\n"
        "- Include accommodation recommendations suitable for the "
        "traveler's budget level based on the provided total budget.\n"
        f"- Provide transportation suggestions within {destination}.\n"
        "- Add money-saving tips and budget optimization strategies.\n"
        "- Include cultural etiquette and local customs travelers should know.\n"
        "- Suggest must-try local foods and where to find them.\n"
        "- Make the itinerary feel realistic, concise, and easy to follow.\n"
    )

    client = get_bedrock_client()

    try:
        response = client.converse(
            modelId=MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={
                "maxTokens": 2048,
                "temperature": 0.7,
                "topP": 0.9,
            },
        )
    except (ClientError, BotoCoreError) as exc:
        raise RuntimeError(f"Bedrock request failed: {exc}") from exc

    content = (
        response.get("output", {})
        .get("message", {})
        .get("content", [])
    )
    recommendation = next(
        (item.get("text", "").strip() for item in content if item.get("text")),
        "",
    )

    if not recommendation:
        raise RuntimeError("Bedrock returned an empty recommendation")

    return recommendation

import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

load_dotenv()

# AWS Bedrock configuration
AWS_BEARER_TOKEN = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")


def get_bedrock_client():
    """
    Configure and return an AWS Bedrock Runtime client.
    Uses the bearer token from the environment as the API key.
    """
    if not AWS_BEARER_TOKEN:
        raise RuntimeError("AWS_BEARER_TOKEN_BEDROCK is not configured")

    # Bedrock API keys are picked up by boto3 from the environment.
    os.environ["AWS_BEARER_TOKEN_BEDROCK"] = AWS_BEARER_TOKEN

    return boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
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
        travel_style: Travel style (e.g. "Adventure", "Relaxation", "Cultural").

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
        "- Keep each day practical, geographically sensible, and aligned with the stated budget and travel style.\n"
        "- Include accommodation recommendations suitable for the traveler's budget level based on the provided total budget.\n"
        f"- Provide transportation suggestions within {destination}.\n"
        "- Add money-saving tips and budget optimization strategies.\n"
        "- Include cultural etiquette and local customs travelers should know.\n"
        "- Suggest must-try local foods and where to find them.\n"
        "- Make the itinerary feel realistic, concise, and easy to follow.\n\n"
        "Example structure:\n"
        "## Day 1: Exploring the Destination\n"
        "**Morning:**\n"
        "- Activity 1\n"
        "- Activity 2\n"
        "- Activity 3\n"
        "**Afternoon:**\n"
        "- Cultural site recommendation\n"
        "- Local experience recommendation\n"
        "**Evening:**\n"
        "- Dinner spot recommendation\n"
        "- Nightlife recommendation\n"
    )

    client = get_bedrock_client()

    try:
        response = client.converse(
            modelId=MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": 2048,
                "temperature": 0.7,
                "topP": 0.9,
            },
        )
    except (ClientError, BotoCoreError) as exc:
        raise RuntimeError(f"Bedrock request failed: {exc}") from exc

    content = response.get("output", {}).get("message", {}).get("content", [])
    recommendation = next(
        (item.get("text", "").strip() for item in content if item.get("text")),
        "",
    )

    if not recommendation:
        raise RuntimeError("Bedrock returned an empty recommendation")

    return recommendation

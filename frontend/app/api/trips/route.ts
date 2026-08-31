import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

function forwardAuth(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("Authorization");
  return auth ? { Authorization: auth } : {};
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { data: JSON.parse(text), status: res.status };
  } catch {
    // Backend returned non-JSON (crash / plain-text error)
    return {
      data:   { detail: text || `Upstream error ${res.status}` },
      status: res.status >= 400 ? res.status : 502,
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const upstream = await fetch(`${BACKEND}/api/v1/trips`, {
      headers: { "Content-Type": "application/json", ...forwardAuth(req) },
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const upstream = await fetch(`${BACKEND}/api/v1/trips`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...forwardAuth(req) },
      body,
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

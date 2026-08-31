import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { data: JSON.parse(text), status: res.status };
  } catch {
    return {
      data:   { detail: text || `Upstream error ${res.status}` },
      status: res.status >= 400 ? res.status : 502,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const upstream = await fetch(`${BACKEND}/api/v1/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

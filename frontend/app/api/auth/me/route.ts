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

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const upstream = await fetch(`${BACKEND}/api/v1/auth/me`, {
      headers: {
        "Content-Type":  "application/json",
        "Authorization": auth,
      },
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

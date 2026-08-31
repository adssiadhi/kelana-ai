import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ id: string }> };

function forwardAuth(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("Authorization");
  return auth ? { Authorization: auth } : {};
}

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

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const upstream = await fetch(`${BACKEND}/api/v1/trips/${id}`, {
      headers: { "Content-Type": "application/json", ...forwardAuth(req) },
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.text();
    const upstream = await fetch(`${BACKEND}/api/v1/trips/${id}`, {
      method:  "PUT",
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

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const upstream = await fetch(`${BACKEND}/api/v1/trips/${id}`, {
      method:  "DELETE",
      headers: { "Content-Type": "application/json", ...forwardAuth(req) },
    });
    const { data, status } = await safeJson(upstream);
    return NextResponse.json(data, { status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}

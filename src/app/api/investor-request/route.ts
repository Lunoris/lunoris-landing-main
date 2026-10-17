import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, org, email, interest, notes } = body ?? {};

    if (!name || !org || !email) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      receivedAt: new Date().toISOString(),
      request: { name, org, email, interest, notes },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}

// app/api/waitlist/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const plan = String(body.plan || "free").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const scriptUrl = process.env.WAITLIST_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json(
        { ok: false, error: "WAITLIST_SCRIPT_URL not set" },
        { status: 500 }
      );
    }

    // Pass through some helpful metadata
    const userAgent = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        plan,
        source: "wovi.app",
        userAgent,
        ip,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Sheet write failed", details: text },
        { status: 500 }
      );
    }

    // Apps Script returns JSON; parse best-effort
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: true };
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const email = body.email;

  if (!email || !email.includes("@")) {
    return new NextResponse("Invalid email", { status: 400 });
  }

  console.log("NEW WAITLIST EMAIL:", email);

  return NextResponse.json({ success: true });
}

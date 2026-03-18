import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "SITE_PASSWORD not configured" }, { status: 500 });
  }

  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("nexus_auth", process.env.SITE_PASSWORD, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

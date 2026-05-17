import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { recordTrustEvent } from "@/lib/swaech/trustEngine";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { emailVerifyToken: token },
  });

  if (!user) return NextResponse.json({ error: "Invalid link" }, { status: 400 });

  if (user.emailVerifyTokenExpiry && user.emailVerifyTokenExpiry < new Date())
    return NextResponse.json({ error: "Link expired" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyTokenExpiry: null,
    },
  });

  // ─── TRUST EVENT HOOK ────────────────────────────────────────────────────
  await recordTrustEvent(user.id, "email_verified").catch(console.error);

  return NextResponse.redirect(new URL(`/home?verified=1`, req.url));
}
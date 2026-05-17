// PLACE AT: app/api/auth/forgot-password/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateToken, PASSWORD_RESET_EXPIRY_MS } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  // Always return 200 — never confirm whether email exists (prevents enumeration)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });

  // Block OAuth users from resetting a password they don't have
  if (user.provider && user.provider !== "credentials")
    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });

  const token = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken:       token,
      passwordResetTokenExpiry: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
    },
  });

  await sendPasswordResetEmail(email, token);
  return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
}
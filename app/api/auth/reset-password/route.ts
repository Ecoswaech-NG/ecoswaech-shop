// PLACE AT: app/api/auth/reset-password/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password)
    return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

  if (!user)
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });

  if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date())
    return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:                hashed,
      passwordResetToken:       null,
      passwordResetTokenExpiry: null,
    },
  });

  // Log the user in immediately after reset
  const jwtToken = await signToken({ userId: user.id, email: user.email });
  const res = NextResponse.json({ success: true, message: "Password updated successfully" });
  res.cookies.set("swaech-token", jwtToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,
    path:     "/",
  });

  return res;
}
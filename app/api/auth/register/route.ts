import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { generateToken, EMAIL_VERIFY_EXPIRY_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { ensureSwaechId } from "@/lib/swaech/createSwaechId"; // Added

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const verifyToken = generateToken();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        provider: "credentials",
        emailVerified: false,
        emailVerifyToken: verifyToken,
        emailVerifyTokenExpiry: new Date(Date.now() + EMAIL_VERIFY_EXPIRY_MS),
      },
    });

    // ─── SWAECH ID HOOK ──────────────────────────────────────────────────────
    await ensureSwaechId(user.id).catch((err) => console.error("SWAECH ID Init failed:", err));

    sendVerificationEmail(email, verifyToken).catch((err) =>
      console.error("Verification email failed:", err)
    );

    const token = await signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.fullName, emailVerified: false },
      message: "Account created. Check your email to verify.",
    }, { status: 201 });

    res.cookies.set("swaech-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Register error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
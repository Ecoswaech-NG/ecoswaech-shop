import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { ensureSwaechId } from "@/lib/swaech/createSwaechId"; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Fetch user
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Check password (using a safe comparison even if user doesn't exist to prevent timing attacks)
    const passwordMatch = user && user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ SWAECH ID BOOTSTRAP 
    // This ensures legacy users or those who skipped registration steps 
    // always have a Swaech ID before they reach the dashboard.
    await ensureSwaechId(user.id).catch((err) => {
        console.error("SWAECH ID Bootstrap failed during login:", err);
        // We don't block login if ID creation fails, but we log it.
    });

    // 3. Issue JWT Token
    const token = await signToken({ 
      userId: user.id, 
      email: user.email 
    });

    const res = NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        emailVerified: user.emailVerified // Helpful for frontend redirection
      },
    });

    // 4. Set secure httpOnly cookie
    res.cookies.set("swaech-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
      path: "/",
    });

    return res;

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Login error:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
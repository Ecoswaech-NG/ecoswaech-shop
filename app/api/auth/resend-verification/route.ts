// PLACE AT: app/api/auth/resend-verification/route.ts
// Lets a logged-in but unverified user request a fresh verification email

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { generateToken, EMAIL_VERIFY_EXPIRY_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.emailVerified)
    return NextResponse.json({ message: "Email is already verified" });

  // Rate-limit: don't resend if a fresh token was issued in last 5 minutes
  if (
    user.emailVerifyTokenExpiry &&
    user.emailVerifyTokenExpiry.getTime() > Date.now() + EMAIL_VERIFY_EXPIRY_MS - 5 * 60 * 1000
  ) {
    return NextResponse.json(
      { error: "Please wait a few minutes before requesting another email" },
      { status: 429 }
    );
  }

  const newToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken:       newToken,
      emailVerifyTokenExpiry: new Date(Date.now() + EMAIL_VERIFY_EXPIRY_MS),
    },
  });

  await sendVerificationEmail(user.email, newToken);
  return NextResponse.json({ success: true, message: "Verification email sent" });
}
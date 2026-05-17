// PLACE AT: app/api/auth/me/route.ts — replaces existing
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/getUser";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.userId },
    select: { id: true, email: true, fullName: true, emailVerified: true, photoURL: true },
  });

  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
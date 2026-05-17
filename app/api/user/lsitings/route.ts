import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.carListing.findMany({
    where:   { userId: session.userId },
    include: { images: { take: 1, select: { imageUrl: true } }, batteryReport: { select: { id: true, grade: true, sohScore: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ listings });
}

export async function DELETE(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const listing = await prisma.carListing.findUnique({ where: { id: Number(id) }, select: { userId: true } });
  if (!listing || listing.userId !== session.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.carListing.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
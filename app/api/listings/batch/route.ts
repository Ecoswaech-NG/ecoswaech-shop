// PLACE AT: app/api/listings/batch/route.ts
// PURPOSE:   Fetch multiple CarListings by a comma-separated list of IDs
// CALLED BY: components/dashboard/DashComponents.tsx → MyFavorites tab
// USAGE:     GET /api/listings/batch?ids=1,5,12,43

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") ?? "";

  const ids = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  if (ids.length === 0) {
    return NextResponse.json({ listings: [] });
  }

  const listings = await prisma.carListing.findMany({
    where:   { id: { in: ids }, status: "active" },
    include: { images: { take: 1, select: { imageUrl: true } } },
    orderBy: { id: "desc" },
  });

  const formatted = listings.map((l) => ({
    ...l,
    images: l.images.map((img) => ({ imageUrl: img.imageUrl })),
  }));

  return NextResponse.json({ listings: formatted });
}
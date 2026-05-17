// app/api/analytics/route.ts
// Track listing view — call this from listing-details page

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: Request) {
  try {
    const session   = await getUserFromRequest(req);
    const { listingId } = await req.json();
    if (!listingId) return NextResponse.json({ ok: false });

    await Promise.all([
      // Record the view event
      prisma.listingView.create({
        data: { listingId: Number(listingId), visitorId: session?.userId ?? null },
      }),
      // Increment counter on listing
      prisma.carListing.update({
        where: { id: Number(listingId) },
        data:  { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }); }
}
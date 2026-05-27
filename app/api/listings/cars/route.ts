import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit     = Math.min(Number(searchParams.get("limit") ?? 10), 50);
    const make      = searchParams.get("make")      ?? undefined;
    const category  = searchParams.get("category")  ?? undefined;
    const type      = searchParams.get("type")      ?? undefined;
    const condition = searchParams.get("condition") ?? undefined;

    const listings = await prisma.carListing.findMany({
      where: {
        status: "active",
        ...(make      && { make }),
        ...(category  && { category }),
        ...(type      && { type }),
        ...(condition && { condition }),
      },
      include: {
        images: {
          take:   1,
          select: { imageUrl: true },
        },
        // ── Include battery report summary for the grade badge ──
        batteryReport: {
          select: {
            id:       true,
            grade:    true,
            sohScore: true,
          },
        },
      },
      orderBy: { id: "desc" },
      take: limit,
    });

    const formatted = listings.map((listing: any) => ({
      ...listing,
      images: listing.images.map((img: any) => ({ imageUrl: img.imageUrl })),
    }));

    return NextResponse.json({ listings: formatted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Listings fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
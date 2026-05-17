import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Props) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id }    = await params;
    const listingId = Number(id);
    const { images } = await req.json() as { images: { imageUrl: string }[] };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Verify this listing belongs to the requesting user
    const listing = await prisma.carListing.findUnique({
      where:  { id: listingId },
      select: { userId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Save all image URLs
    await prisma.carImage.createMany({
      data: images.map((img) => ({
        imageUrl:     img.imageUrl,
        carListingId: listingId,
      })),
    });

    return NextResponse.json({ success: true, count: images.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Image save error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
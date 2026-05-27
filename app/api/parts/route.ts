import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

    const [chargers, accessories] = await Promise.all([
      prisma.charger.findMany({
        where:   { status: "active" },
        include: { images: { take: 1, select: { imageUrl: true } } },
        orderBy: { id: "desc" },
        take:    Math.ceil(limit / 2),
      }),
      prisma.accessory.findMany({
        where:   { status: "active" },
        include: { images: { take: 1, select: { imageUrl: true } } },
        orderBy: { id: "desc" },
        take:    Math.floor(limit / 2),
      }),
    ]);

    // Normalise both into a unified shape
    const combined = [
      ...chargers.map((c: any) => ({
        id:       c.id,
        itemType: "charger" as const,
        name:     `${c.brand} ${c.model}`,
        brand:    c.brand,
        model:    c.model,
        type:     c.type,
        power:    c.power,
        price:    c.price,
        location: c.location,
        images:   c.images.map((img: any) => ({ url: img.imageUrl })),
      })),
      ...accessories.map((a: any) => ({
        id:       a.id,
        itemType: "accessory" as const,
        name:     a.name,
        brand:    a.brand,
        model:    null,
        type:     null,
        power:    null,
        price:    a.price,
        location: a.location,
        images:   a.images.map((img: any) => ({ url: img.imageUrl })),
      })),
    ];

    // Fisher-Yates shuffle for variety
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return NextResponse.json({ items: combined });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Parts fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
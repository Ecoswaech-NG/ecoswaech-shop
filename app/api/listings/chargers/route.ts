import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const required = ["brand", "model", "type", "specification", "price", "power", "location"];
    const missing  = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const charger = await prisma.charger.create({
      data: {
        listingTitle:  body.listingTitle  ?? null,
        brand:         body.brand,
        model:         body.model,
        type:          body.type,
        specification: body.specification,
        price:         Number(body.price),
        power:         body.power,
        location:      body.location,
        description:   body.description   ?? null,
        createdBy:     body.createdBy,
        userName:      body.userName      ?? "Anonymous",
        userImageUrl:  body.userImageUrl  ?? null,
        postedOn:      body.postedOn      ?? new Date().toISOString(),
        userId:        session.userId,
      },
    });

    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.chargerImage.createMany({
        data: body.images.map((img: { imageUrl: string }) => ({
          imageUrl:  img.imageUrl,
          chargerId: charger.id,
        })),
      });
    }

    return NextResponse.json({ success: true, id: charger.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Charger listing error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
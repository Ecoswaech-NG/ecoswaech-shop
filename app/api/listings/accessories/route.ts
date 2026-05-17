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

    const required = ["name", "brand", "price", "location"];
    const missing  = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const accessory = await prisma.accessory.create({
      data: {
        name:           body.name,
        brand:          body.brand,
        price:          Number(body.price),
        compatibleWith: Array.isArray(body.compatibleWith) ? body.compatibleWith : [],
        location:       body.location,
        description:    body.description   ?? null,
        createdBy:      body.createdBy,
        userName:       body.userName      ?? "Anonymous",
        userImageUrl:   body.userImageUrl  ?? null,
        postedOn:       body.postedOn      ?? new Date().toISOString(),
        userId:         session.userId,
      },
    });

    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.accessoryImage.createMany({
        data: body.images.map((img: { imageUrl: string }) => ({
          imageUrl:    img.imageUrl,
          accessoryId: accessory.id,
        })),
      });
    }

    return NextResponse.json({ success: true, id: accessory.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Accessory listing error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
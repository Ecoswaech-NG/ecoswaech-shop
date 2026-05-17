import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch accessories from the database
    // Adjust the model name based on your Prisma schema
    const accessories = await prisma.accessory.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedAccessories = accessories.map((accessory: any) => ({
      id: accessory.id,
      name: accessory.name,
      brand: accessory.brand,
      type: accessory.type,
      location: accessory.location,
      price: accessory.price,
    }));

    return NextResponse.json(formattedAccessories);
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return NextResponse.json([], { status: 500 });
  }
}

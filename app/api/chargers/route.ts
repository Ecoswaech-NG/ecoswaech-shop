import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch chargers from the database
    // Adjust the model name based on your Prisma schema
    const chargers = await prisma.charger.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedChargers = chargers.map((charger: any) => ({
      id: charger.id,
      brand: charger.brand,
      model: charger.model,
      type: charger.type,
      power: charger.power,
      location: charger.location,
      price: charger.price,
    }));

    return NextResponse.json(formattedChargers);
  } catch (error) {
    console.error("Error fetching chargers:", error);
    return NextResponse.json([], { status: 500 });
  }
}

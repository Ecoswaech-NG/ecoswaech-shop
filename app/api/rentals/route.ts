import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rentals = await prisma.rental.findMany({
      select: {
        id: true,
        vehicle: true,
        location: true,
        daily: true,
        weekly: true,
        monthly: true,
        deposit: true,
        minAge: true,
        insurance: true,
        delivery: true,
        deliveryFee: true,
        rules: true,
        userName: true,
        userImageUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json([], { status: 500 });
  }
}

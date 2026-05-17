import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rental = await prisma.rental.create({
      data: {
        vehicle: body.vehicle,
        location: body.location,
        daily: body.daily,
        weekly: body.weekly,
        monthly: body.monthly,
        deposit: body.deposit,
        minAge: body.minAge,
        insurance: body.insurance ?? false,
        delivery: body.delivery ?? false,
        deliveryFee: body.deliveryFee,
        rules: body.rules,
        createdBy: body.createdBy,
        userName: body.userName,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, rental });
  } catch (error) {
    console.error("Error creating rental listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create rental listing" },
      { status: 500 }
    );
  }
}

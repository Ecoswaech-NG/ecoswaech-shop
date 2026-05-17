import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user?.email) {
      return NextResponse.json({ rentals: [] });
    }

    const rentals = await prisma.rental.findMany({
      where: { 
        createdBy: user.email
      },
      include: {
        images: {
          select: { imageUrl: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      rentals: rentals.map(rental => ({
        id: rental.id,
        vehicle: rental.vehicle,
        location: rental.location,
        daily: rental.daily,
        weekly: rental.weekly,
        monthly: rental.monthly,
        deposit: rental.deposit,
        minAge: rental.minAge,
        insurance: rental.insurance,
        delivery: rental.delivery,
        deliveryFee: rental.deliveryFee,
        rules: rental.rules,
        status: rental.status,
        images: rental.images,
        createdAt: rental.createdAt,
      }))
    });
  } catch (error) {
    console.error("Error fetching user rentals:", error);
    return NextResponse.json({ rentals: [], error: "Failed to fetch rentals" }, { status: 500 });
  }
}

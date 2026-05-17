import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const logistics = await prisma.logistics.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        coverage: true,
        pricing: true,
        contact: true,
        specializations: true,
        certifications: true,
        status: true,
        userName: true,
        userImageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logistics);
  } catch (error) {
    console.error("Error fetching logistics:", error);
    return NextResponse.json([], { status: 500 });
  }
}

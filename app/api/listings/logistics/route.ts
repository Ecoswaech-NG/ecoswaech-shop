import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const logistics = await prisma.logistics.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        coverage: body.coverage,
        pricing: body.pricing,
        contact: body.contact,
        specializations: body.specializations,
        certifications: body.certifications,
        createdBy: body.createdBy,
        userName: body.userName,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, logistics });
  } catch (error) {
    console.error("Error creating logistics service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create logistics service" },
      { status: 500 }
    );
  }
}

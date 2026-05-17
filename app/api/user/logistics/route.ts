// PLACE AT: app/api/listings/logistics/route.ts
// PURPOSE:   Create a new Logistics service listing
// CALLED BY: components/dashboard/DashComponents.tsx → MyLogistics modal form

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const required = ["name", "type"];
  const missing  = required.filter((f) => !body[f]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const service = await prisma.logistics.create({
    data: {
      name:            body.name,
      type:            body.type,
      description:     body.description     ?? null,
      coverage:        body.coverage        ?? null,
      pricing:         body.pricing         ?? null,
      contact:         body.contact         ?? null,
      specializations: body.specializations ?? null,
      certifications:  body.certifications  ?? null,
      createdBy:       body.createdBy,
      userName:        body.userName        ?? "",
      postedOn:        new Date().toISOString(),
      userId:          session.userId,
    },
  });

  return NextResponse.json({ success: true, id: service.id }, { status: 201 });
}
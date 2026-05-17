// PLACE AT: app/api/listings/rentals/route.ts
// PURPOSE:   Create a new Rental listing
// CALLED BY: components/dashboard/DashComponents.tsx → MyRentals modal form

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const required = ["vehicle", "location"];
  const missing  = required.filter((f) => !body[f]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const rental = await prisma.rental.create({
    data: {
      vehicle:     body.vehicle,
      location:    body.location,
      daily:       body.daily       ? Number(body.daily)       : null,
      weekly:      body.weekly      ? Number(body.weekly)      : null,
      monthly:     body.monthly     ? Number(body.monthly)     : null,
      deposit:     body.deposit     ? Number(body.deposit)     : null,
      minAge:      body.minAge      ? Number(body.minAge)      : null,
      insurance:   Boolean(body.insurance),
      delivery:    Boolean(body.delivery),
      deliveryFee: body.deliveryFee ? Number(body.deliveryFee) : null,
      rules:       body.rules       ?? null,
      createdBy:   body.createdBy,
      userName:    body.userName    ?? "",
      postedOn:    new Date().toISOString(),
      userId:      session.userId,
    },
  });

  return NextResponse.json({ success: true, id: rental.id }, { status: 201 });
}
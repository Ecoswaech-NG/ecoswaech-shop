// ─────────────────────────────────────────────────────────────────────────────
// PLACE AT: app/api/swaech/garage/route.ts
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const swaech = await prisma.swaechID.findUnique({
    where:   { userId: session.userId },
    include: { vehicles: { orderBy: { addedAt: "desc" } } },
  });

  return NextResponse.json({ vehicles: swaech?.vehicles ?? [] });
}

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { make, model, year, vin, listingId, vehicleId } = await req.json();
  if (!make || !model || !year)
    return NextResponse.json({ error: "make, model and year required" }, { status: 400 });

  const swaech = await prisma.swaechID.findUnique({ where: { userId: session.userId } });
  if (!swaech) return NextResponse.json({ error: "SWAECH ID not found" }, { status: 404 });

  const vehicle = await prisma.swaechVehicle.create({
    data: {
      swaechId:  swaech.id,
      make, model,
      year:      Number(year),
      vin:       vin       ?? null,
      listingId: listingId ? Number(listingId) : null,
      vehicleId: vehicleId ?? null,
    },
  });

  return NextResponse.json({ success: true, vehicle }, { status: 201 });
}
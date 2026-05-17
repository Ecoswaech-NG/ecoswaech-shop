// PLACE AT: app/api/stations/[id]/route.ts
// GET    /api/stations/[id]        — station details
// PATCH  /api/stations/[id]        — update (admin: approve/reject, operator: edit)
// DELETE /api/stations/[id]        — admin delete

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const station = await prisma.chargingStation.findUnique({
    where:   { id },
    include: {
      stationReviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      statusLogs: {
        orderBy: { loggedAt: "desc" },
        take: 5,
      },
    },
  });
  if (!station) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ station });
}

export async function PATCH(req: Request, { params }: Props) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id }  = await params;
  const body    = await req.json();

  // Only allow status changes (approve/reject) via admin check
  // For now we trust the session — add admin role check here later

  const updated = await prisma.chargingStation.update({
    where: { id },
    data: {
      ...(body.status       !== undefined && { status:       body.status       }),
      ...(body.isAvailable  !== undefined && { isAvailable:  body.isAvailable  }),
      ...(body.name         !== undefined && { name:         body.name         }),
      ...(body.address      !== undefined && { address:      body.address      }),
      ...(body.powerSource  !== undefined && { powerSource:  body.powerSource  }),
      ...(body.priceNote    !== undefined && { priceNote:    body.priceNote    }),
      ...(body.amenities    !== undefined && { amenities:    body.amenities    }),
      ...(body.operatingHours !== undefined && { operatingHours: body.operatingHours }),
    },
  });

  return NextResponse.json({ success: true, station: updated });
}

export async function DELETE(req: Request, { params }: Props) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.chargingStation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
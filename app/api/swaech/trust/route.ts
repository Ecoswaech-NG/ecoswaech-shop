// PLACE AT: app/api/swaech/trust/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { recomputeFullScore } from "@/lib/swaech/trustEngine";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const swaech = await prisma.swaechID.findUnique({ where: { userId: session.userId } });
  if (!swaech) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await prisma.trustLog.findMany({
    where:   { swaechId: swaech.id },
    orderBy: { createdAt: "desc" },
    take:    20,
  });

  return NextResponse.json({ trustScore: swaech.trustScore, logs });
}

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await recomputeFullScore(session.userId);
  if (!updated) return NextResponse.json({ error: "SWAECH ID not found" }, { status: 404 });

  return NextResponse.json({ success: true, trustScore: updated.trustScore });
}
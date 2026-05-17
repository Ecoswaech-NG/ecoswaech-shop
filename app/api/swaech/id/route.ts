// PLACE AT: app/api/swaech/id/route.ts
// Returns SUMMARY only — tag, trust, balance, verification level.
// Each tab fetches its own data lazily via separate endpoints.

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { ensureSwaechId } from "@/lib/swaech/createSwaechId";
import { deriveWalletBalance, levelFromScore } from "@/lib/swaech/trustEngine";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Auto-create if missing
  await ensureSwaechId(session.userId);

  const swaech = await prisma.swaechID.findUnique({
    where:   { userId: session.userId },
    include: {
      trustLogs: {
        orderBy: { createdAt: "desc" },
        take:    5,
        select:  { action: true, delta: true, reason: true, newScore: true, createdAt: true },
      },
    },
  });

  if (!swaech) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Derive real balance from ledger
  const walletBalance = await deriveWalletBalance(swaech.id);

  // Sync cached balance if drift detected
  if (Math.abs(walletBalance - swaech.walletBalance) > 0.01) {
    await prisma.swaechID.update({
      where: { id: swaech.id },
      data:  { walletBalance },
    });
  }

  const verificationLevel = levelFromScore(swaech.trustScore, swaech.isVerified);

  return NextResponse.json({
    swaech: {
      id:                   swaech.id,
      swaechTag:            swaech.swaechTag,
      isVerified:           swaech.isVerified,
      verificationLevel,
      walletBalance,
      trustScore:           swaech.trustScore,
      trustEmailVerified:   swaech.trustEmailVerified,
      trustVerifiedBattery: swaech.trustVerifiedBattery,
      trustIsDealer:        swaech.trustIsDealer,
      trustHasTransactions: swaech.trustHasTransactions,
      trustCompletedSales:  swaech.trustCompletedSales,
      recentTrustLogs:      swaech.trustLogs,
      createdAt:            swaech.createdAt,
    },
  });
}
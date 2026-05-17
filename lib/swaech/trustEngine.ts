// PLACE AT: lib/swaech/trustEngine.ts
// Event-driven trust scoring — every change is logged with delta + reason.
// Call recordTrustEvent() whenever a qualifying action occurs.
// Call recomputeFullScore() to reconcile from scratch (e.g. after data migration).

import { prisma } from "@/lib/prisma";

// ── Trust event definitions ───────────────────────────────────────────────────

export const TRUST_EVENTS = {
  email_verified:    { delta: 10, reason: "Email address verified"            },
  battery_report:    { delta: 20, reason: "Battery Passport created"          },
  first_transaction: { delta: 10, reason: "First wallet transaction"          },
  completed_sale:    { delta: 15, reason: "Listing marked as sold"            },
  dealer_verified:   { delta: 15, reason: "Dealer identity verified"          },
  id_submitted:      { delta:  5, reason: "Government ID submitted"           },
} as const;

export type TrustEventType = keyof typeof TRUST_EVENTS;

// ── Record a single trust event ───────────────────────────────────────────────

export async function recordTrustEvent(
  userId:    string,
  eventType: TrustEventType,
) {
  const swaech = await prisma.swaechID.findUnique({ where: { userId } });
  if (!swaech) return;

  const event    = TRUST_EVENTS[eventType];
  const newScore = Math.min(100, swaech.trustScore + event.delta);

  // Update flag + score atomically
  const flagMap: Record<TrustEventType, object> = {
    email_verified:    { trustEmailVerified:   true },
    battery_report:    { trustVerifiedBattery: true },
    first_transaction: { trustHasTransactions: true },
    completed_sale:    { trustCompletedSales:  true },
    dealer_verified:   { trustIsDealer:        true },
    id_submitted:      {},
  };

  await prisma.$transaction([
    prisma.swaechID.update({
      where: { id: swaech.id },
      data:  { trustScore: newScore, ...flagMap[eventType] },
    }),
    prisma.trustLog.create({
      data: {
        swaechId: swaech.id,
        action:   eventType,
        delta:    event.delta,
        reason:   event.reason,
        newScore,
      },
    }),
  ]);

  return newScore;
}

// ── Full reconciliation — recompute from data (not from logs) ─────────────────
// Use this on data migration or as a cron job, not on every request.

export async function recomputeFullScore(userId: string) {
  const [user, swaech, batteryReports, transactions, soldListings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } }),
    prisma.swaechID.findUnique({ where: { userId } }),
    prisma.batteryReport.findMany({ where: { userId }, take: 1 }),
    prisma.transaction.findMany({ where: { swaech: { userId } }, take: 1 }),
    prisma.carListing.findMany({ where: { userId, status: "sold" }, take: 1 }),
  ]);

  if (!swaech || !user) return null;

  let score = 10; // base
  const flags = {
    trustEmailVerified:   user.emailVerified,
    trustVerifiedBattery: batteryReports.length > 0,
    trustIsDealer:        swaech.isVerified,
    trustHasTransactions: transactions.length > 0,
    trustCompletedSales:  soldListings.length > 0,
  };

  if (flags.trustEmailVerified)   score += 10;
  if (flags.trustVerifiedBattery) score += 20;
  if (flags.trustIsDealer)        score += 15;
  if (flags.trustHasTransactions) score += 10;
  if (flags.trustCompletedSales)  score += 15;

  score = Math.min(score, 100);

  const updated = await prisma.swaechID.update({
    where: { id: swaech.id },
    data:  { trustScore: score, ...flags },
  });

  return updated;
}

// ── Derive wallet balance from ledger (never trust stored walletBalance alone) ─

export async function deriveWalletBalance(swaechId: string): Promise<number> {
  const txs = await prisma.transaction.findMany({
    where:  { swaechId, status: "completed" },
    select: { amount: true, type: true },
  });

  return txs.reduce((acc, tx) => {
    return tx.type === "credit" ? acc + tx.amount : acc - tx.amount;
  }, 0);
}

// ── Verification level helper ─────────────────────────────────────────────────

export function levelFromScore(score: number, isVerified: boolean): string {
  if (!isVerified || score < 20)    return "none";
  if (score < 40)                   return "basic";
  if (score < 80)                   return "verified";
  return "premium";
}
// PLACE AT: app/api/swaech/wallet/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { deriveWalletBalance, recordTrustEvent } from "@/lib/swaech/trustEngine";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const swaech = await prisma.swaechID.findUnique({ where: { userId: session.userId } });
  if (!swaech) return NextResponse.json({ error: "SWAECH ID not found" }, { status: 404 });

  const balance = await deriveWalletBalance(swaech.id);

  const transactions = await prisma.transaction.findMany({
    where:   { swaechId: swaech.id },
    orderBy: { createdAt: "desc" },
    take:    20,
  });

  return NextResponse.json({ balance, transactions });
}

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { amount, type, category, description, reference } = body;

  // Validate inputs server-side — NEVER trust client for financial ops
  if (!amount || !type || !category)
    return NextResponse.json({ error: "amount, type and category required" }, { status: 400 });

  if (!["credit", "debit"].includes(type))
    return NextResponse.json({ error: "type must be credit or debit" }, { status: 400 });

  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0)
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });

  const swaech = await prisma.swaechID.findUnique({ where: { userId: session.userId } });
  if (!swaech) return NextResponse.json({ error: "SWAECH ID not found" }, { status: 404 });

  // Derive real balance from ledger before allowing debit
  if (type === "debit") {
    const realBalance = await deriveWalletBalance(swaech.id);
    if (realBalance < parsed)
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₦${realBalance.toLocaleString()}` },
        { status: 400 }
      );
  }

  // Idempotency — reject duplicate reference
  if (reference) {
    const existing = await prisma.transaction.findUnique({ where: { reference } });
    if (existing)
      return NextResponse.json({ error: "Duplicate transaction reference" }, { status: 409 });
  }

  const ref = reference ?? `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  // Atomic: create transaction + sync cached balance
  const balanceDelta = type === "credit" ? parsed : -parsed;

  const [tx] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        swaechId:    swaech.id,
        amount:      parsed,
        type,
        status:      "completed",
        category,
        description: description ?? null,
        reference:   ref,
      },
    }),
    prisma.swaechID.update({
      where: { id: swaech.id },
      data:  { walletBalance: { increment: balanceDelta } },
    }),
  ]);

  // Award trust for first transaction
  if (!swaech.trustHasTransactions) {
    await recordTrustEvent(session.userId, "first_transaction");
  }

  return NextResponse.json({ success: true, transaction: tx, reference: ref });
}
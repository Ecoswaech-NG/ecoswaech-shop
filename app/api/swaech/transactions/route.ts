// PLACE AT: app/api/swaech/transactions/route.ts
// Separate from wallet POST — read-only history, paginated.

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function GET(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const swaech = await prisma.swaechID.findUnique({ where: { userId: session.userId } });
  if (!swaech) return NextResponse.json({ transactions: [], total: 0 });

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where:   { swaechId: swaech.id },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.transaction.count({ where: { swaechId: swaech.id } }),
  ]);

  return NextResponse.json({ transactions, total, page, totalPages: Math.ceil(total / limit) });
}
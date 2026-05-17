// PLACE AT: lib/swaech/createSwaechId.ts

import { prisma } from "@/lib/prisma";

// ── Tag format: SW-USER-XXXX | SW-DEALER-XXXX ─────────────────────────────
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

function randomSuffix(len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

async function generateUniqueTag(prefix: "USER" | "DEALER"): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const tag = `SW-${prefix}-${randomSuffix(4)}`;
    const exists = await prisma.swaechID.findUnique({ where: { swaechTag: tag } });
    if (!exists) return tag;
  }
  // Fallback with timestamp — practically impossible to collide
  return `SW-${prefix}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export async function ensureSwaechId(
  userId: string,
  role: "USER" | "DEALER" = "USER"
) {
  const existing = await prisma.swaechID.findUnique({ where: { userId } });
  if (existing) return existing;

  const tag = await generateUniqueTag(role);

  return prisma.swaechID.create({
    data: { userId, swaechTag: tag },
  });
}
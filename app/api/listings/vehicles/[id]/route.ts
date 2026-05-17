import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { recordTrustEvent } from "@/lib/swaech/trustEngine"; // Added

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const listing = await prisma.carListing.findUnique({
      where: { id: idNum },
      include: {
        images: true,
        batteryReport: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getUserFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const idNum = Number(id);
    const body = await req.json();

    const existing = await prisma.carListing.findUnique({
      where: { id: idNum },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = (existing.userId === session.userId) || (existing.user?.email === session.email);
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatable: Record<string, any> = {};
    if ("status" in body) updatable.status = body.status ?? "active";
    if ("sellingPrice" in body) updatable.sellingPrice = parseFloat(String(body.sellingPrice));
    // ... (add other fields as per previous logic)

    const updated = await prisma.carListing.update({
      where: { id: idNum },
      data: updatable,
    });

    // ─── TRUST EVENT HOOK ────────────────────────────────────────────────────
    if (body.status === "sold") {
      await recordTrustEvent(session.userId, "completed_sale").catch(console.error);
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getUserFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const idNum = Number(id);

    const existing = await prisma.carListing.findUnique({
      where: { id: idNum },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.carListing.delete({ where: { id: idNum } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
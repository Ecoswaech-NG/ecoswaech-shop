import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { recordTrustEvent } from "@/lib/swaech/trustEngine"; // Added

function calculateSoH(voltage: number, mileage: number): number {
  if (voltage > 380 && mileage < 50000) return 90;
  if (voltage > 360 && mileage < 100000) return 80;
  if (voltage > 340 && mileage < 150000) return 70;
  return 60;
}

function getGrade(soh: number): string {
  if (soh >= 85) return "A";
  if (soh >= 70) return "B";
  if (soh >= 50) return "C";
  return "D";
}

export async function POST(req: Request) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const make = String(body.make ?? "").trim();
    const model = String(body.model ?? "").trim();
    const voltage = Number(body.voltage);
    const mileage = Number(body.mileage);
    const batteryCapacity = Number(body.batteryCapacity);
    const year = Number(body.year);
    const vin = String(body.vin ?? "").trim() || null;

    if (!make || !model) return NextResponse.json({ success: false, error: "Required fields missing" }, { status: 400 });

    const sohScore = calculateSoH(voltage, mileage);
    const grade = getGrade(sohScore);

    const report = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: { make, model, year, ownerId: session.userId },
      });

      const newReport = await tx.batteryReport.create({
        data: {
          vin,
          vehicleId: vehicle.id,
          userId: session.userId,
          batteryCapacity,
          voltage,
          mileage,
          sohScore,
          grade,
          notes: body.notes ?? "",
        },
      });

      if (vin) {
        const matchingListing = await tx.carListing.findFirst({
          where: { vin, batteryReportId: null },
        });

        if (matchingListing) {
          await tx.carListing.update({
            where: { id: matchingListing.id },
            data: { batteryReportId: newReport.id },
          });
        }
      }

      return newReport;
    });

    // ─── TRUST EVENT HOOK ────────────────────────────────────────────────────
    await recordTrustEvent(session.userId, "battery_report").catch(console.error);

    return NextResponse.json({ success: true, id: report.id });
  } catch (error) {
    console.error("Report creation failed:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
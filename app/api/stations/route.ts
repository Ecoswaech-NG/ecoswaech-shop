// PLACE AT: app/api/stations/route.ts
// GET  /api/stations?lat=&lng=&radius=&type=&available=
// POST /api/stations — operator onboarding (creates pending station)

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

// Haversine distance — returns km between two coordinates
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userLat   = parseFloat(searchParams.get("lat")   ?? "0");
  const userLng   = parseFloat(searchParams.get("lng")   ?? "0");
  const radius    = parseFloat(searchParams.get("radius") ?? "50"); // km
  const type      = searchParams.get("type")      ?? "";
  const available = searchParams.get("available") ?? "";
  const power     = searchParams.get("power")     ?? "";

  const where: any = { status: "approved" };
  if (type)      where.stationType = type;
  if (available) where.isAvailable = available === "true";
  if (power)     where.powerSource = power;

  const stations = await prisma.chargingStation.findMany({
    where,
    include: {
      stationReviews: { select: { rating: true }, take: 100 },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach distance and filter by radius if user location provided
  const withDistance = stations.map((s: any) => {
    const dist = userLat && userLng
      ? haversine(userLat, userLng, s.lat, s.lng)
      : null;
    const avgRating = s.stationReviews.length
      ? s.stationReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / s.stationReviews.length
      : null;
    return { ...s, distanceKm: dist, avgRating, reviewCount: s.stationReviews.length };
  }).filter((s: any) => {
    if (!userLat || !userLng || !s.distanceKm) return true;
    return s.distanceKm <= radius;
  }).sort((a: any, b: any) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  return NextResponse.json({ stations: withDistance });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getUserFromRequest(req);

    const required = ["name", "address", "lat", "lng", "chargerTypes", "powerOutput"];
    const missing  = required.filter((f) => body[f] == null || body[f] === "");
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const station = await prisma.chargingStation.create({
      data: {
        name:          body.name,
        address:       body.address,
        lat:           Number(body.lat),
        lng:           Number(body.lng),
        stationType:   body.stationType   ?? "public",
        chargerTypes:  body.chargerTypes,           // array
        powerOutput:   body.powerOutput,
        numberOfPorts: Number(body.numberOfPorts ?? 1),
        pricePerKwh:   body.pricePerKwh   ? Number(body.pricePerKwh)  : null,
        pricePerHour:  body.pricePerHour  ? Number(body.pricePerHour) : null,
        priceNote:     body.priceNote     ?? null,
        powerSource:   body.powerSource   ?? "grid",
        operatingHours:body.operatingHours ?? "24/7",
        is24Hours:     Boolean(body.is24Hours ?? true),
        amenities:     body.amenities     ?? [],
        operatorName:  body.operatorName  ?? null,
        operatorPhone: body.operatorPhone ?? null,
        operatorEmail: body.operatorEmail ?? null,
        status:        "pending",           // always starts pending
        userId:        session?.userId      ?? null,
      },
    });

    return NextResponse.json({ success: true, id: station.id }, { status: 201 });
  } catch (error) {
    console.error("Station create error:", error);
    return NextResponse.json({ error: "Failed to create station" }, { status: 500 });
  }
}
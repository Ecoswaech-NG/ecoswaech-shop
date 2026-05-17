// PLACE AT: app/api/stations/geocode/route.ts
// GET /api/stations/geocode?address=123+Main+St+Lagos
// Uses Nominatim (OpenStreetMap) — completely free, no API key needed
// Returns { lat, lng, displayName } or { error }

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address?.trim()) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ng`;

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent header
        "User-Agent": "ECOSWAP-EV-Marketplace/1.0",
        "Accept-Language": "en",
      },
    });

    const data = await res.json();

    if (!data.length) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      lat:         parseFloat(data[0].lat),
      lng:         parseFloat(data[0].lon),
      displayName: data[0].display_name,
    });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
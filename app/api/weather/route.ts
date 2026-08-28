import { NextResponse } from "next/server";
import { getLiveOrFallbackWeather } from "@/lib/weather";
import type { WeatherQuery } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");
    const district = searchParams.get("district") || undefined;
    const state = searchParams.get("state") || undefined;
    const modeStr = searchParams.get("mode");

    const query: WeatherQuery = {
      latitude: latStr ? parseFloat(latStr) : undefined,
      longitude: lonStr ? parseFloat(lonStr) : undefined,
      district: district,
      state: state,
      mode: modeStr === "demo" ? "demo" : "live",
    };

    const payload = await getLiveOrFallbackWeather(query);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[API /api/weather error]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch live weather data.",
      },
      { status: 500 }
    );
  }
}

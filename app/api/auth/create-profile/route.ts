import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, district, occupation, language, notificationPreferences } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId and email" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { message: "Supabase service client not configured, skipped database sync" },
        { status: 200 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("supabase_auth_id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { message: "Profile already exists", profile: existingProfile },
        { status: 200 }
      );
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        supabase_auth_id: userId,
        state: "Tamil Nadu",
        district: district || "Chennai",
        city: "",
        latitude: null,
        longitude: null,
        occupation: occupation || "student",
        language: language || "en",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Create notification preferences with user selections
    const prefs = notificationPreferences || {};
    const { error: prefsError } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: profile.id,
        heavy_rainfall: prefs.heavyRainfall ?? true,
        official_closures: prefs.officialClosures ?? true,
        heatwaves_drought: prefs.heatwavesAndDrought ?? true,
        travel_disruptions: prefs.travelDisruptions ?? true,
        agricultural_impact: prefs.agriculturalImpact ?? true,
      });

    if (prefsError) {
      console.error("Error creating notification preferences:", prefsError);
    }

    return NextResponse.json(
      { message: "Profile created successfully", profile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in create-profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
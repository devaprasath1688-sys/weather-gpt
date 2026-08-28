"use client";

import React from "react";
import { Crosshair, MapPin, Navigation, Loader2, XCircle, AlertTriangle } from "lucide-react";
import type { GeoPermissionState } from "@/lib/geo/useGeolocation";
import { DISTRICT_COORDINATES } from "@/lib/geo/districtCoordinates";

type LocationSource = "gps" | "manual" | "demo";

type LocationControlsProps = {
  permissionState: GeoPermissionState;
  locationSource: LocationSource;
  currentDistrict: string;
  gpsLat: number | null;
  gpsLon: number | null;
  errorMessage: string | null;
  onRequestGPS: () => void;
  onSelectDistrict: (district: string) => void;
  onRecenter: () => void;
};

const DISTRICT_NAMES = Object.keys(DISTRICT_COORDINATES);

export function LocationControls({
  permissionState,
  locationSource,
  currentDistrict,
  gpsLat,
  gpsLon,
  errorMessage,
  onRequestGPS,
  onSelectDistrict,
  onRecenter,
}: LocationControlsProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-white" />
          Location Control
        </span>
        <span className="text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700">
          {locationSource === "gps" ? "📍 GPS LIVE" : locationSource === "manual" ? "📌 MANUAL" : "🎭 PRESET"}
        </span>
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={onRequestGPS}
        disabled={permissionState === "requesting"}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-200 text-black px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {permissionState === "requesting" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Detecting Coordinates...</span>
          </>
        ) : (
          <>
            <Crosshair className="h-3.5 w-3.5" />
            <span>Use My Location (GPS)</span>
          </>
        )}
      </button>

      {/* Error/Status Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-[11px] text-neutral-300 flex items-start gap-2">
          {permissionState === "denied" ? (
            <XCircle className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
          )}
          <span>{errorMessage}</span>
        </div>
      )}

      {/* GPS Coordinates Display */}
      {gpsLat !== null && gpsLon !== null && locationSource === "gps" && (
        <div className="rounded-xl bg-neutral-900 border border-neutral-700 p-3 text-xs space-y-1">
          <span className="font-bold text-white text-[10px] uppercase tracking-wider block font-mono">Live GPS Telemetry</span>
          <div className="font-mono text-neutral-300">
            {gpsLat.toFixed(4)}°N, {gpsLon.toFixed(4)}°E
          </div>
        </div>
      )}

      {/* District Selector */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
          <MapPin className="h-3 w-3 text-neutral-400" />
          Select District
        </label>
        <select
          value={currentDistrict}
          onChange={(e) => onSelectDistrict(e.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors focus:border-white focus:outline-none"
        >
          {DISTRICT_NAMES.map((dist) => (
            <option key={dist} value={dist} className="bg-neutral-900 text-white">
              {dist} District
            </option>
          ))}
        </select>
      </div>

      {/* Recenter Button */}
      <button
        type="button"
        onClick={onRecenter}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 text-[11px] font-semibold text-neutral-300 transition-colors"
      >
        <Crosshair className="h-3 w-3" />
        <span>Recenter Map</span>
      </button>
    </div>
  );
}

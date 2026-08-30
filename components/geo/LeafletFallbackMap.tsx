"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1x1 transparent PNG fallback for missing/error tiles
const TRANSPARENT_TILE_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Custom high-contrast location pin with radar pulse
const LOCATION_PIN_ICON = new L.DivIcon({
  className: "wgpt-location-pin",
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
      <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(56,189,248,0.35);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative;width:16px;height:16px;border-radius:50%;background:#38bdf8;border:3px solid #040810;box-shadow:0 0 14px rgba(56,189,248,0.9);"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Map Controller for smooth flyTo animations
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [map, center, zoom]);

  return null;
}

export type LeafletFallbackMapProps = {
  center: [number, number];
  zoom?: number;
  selectedDistrict: string;
  locationSource?: "gps" | "manual";
  mapMode?: "hybrid" | "street";
  onMapModeChange?: (mode: "hybrid" | "street") => void;
};

export function LeafletFallbackMap({
  center,
  zoom = 13,
  selectedDistrict,
  locationSource = "manual",
  mapMode: propMapMode,
}: LeafletFallbackMapProps) {
  const [internalMapMode] = useState<"hybrid" | "street">("hybrid");
  const activeMapMode = propMapMode ?? internalMapMode;

  // Optional custom tile URL via environment variable
  const customTileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL;
  // Free, zero-API-key OpenStreetMap standard tile layer as reliable default
  const streetTileUrl =
    customTileUrl || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="relative h-full w-full bg-[#040810] overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={4}
        maxZoom={20}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%", background: "#040810" }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* =================================================================== */}
        {/* BASE TILE LAYERS                                                    */}
        {/* =================================================================== */}
        {activeMapMode === "hybrid" ? (
          <>
            {/* Esri World Imagery (Satellite) with maxNativeZoom: 17 to prevent "Map not available" errors */}
            <TileLayer
              key="satellite-base"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
              maxNativeZoom={17}
              errorTileUrl={TRANSPARENT_TILE_DATA_URI}
              keepBuffer={4}
            />

            {/* Esri Official Boundaries & Places Reference Labels (Roads, Place Names, Boundaries) */}
            <TileLayer
              key="satellite-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
              maxNativeZoom={19}
              errorTileUrl={TRANSPARENT_TILE_DATA_URI}
              keepBuffer={4}
            />
          </>
        ) : (
          /* Street / Road Vector Map (OpenStreetMap Standard / Custom Tile URL) - Zero API Key Required */
          <TileLayer
            key="street-base"
            url={streetTileUrl}
            maxZoom={20}
            maxNativeZoom={19}
            errorTileUrl={TRANSPARENT_TILE_DATA_URI}
            keepBuffer={4}
          />
        )}

        {/* Smooth Recentering */}
        <MapController center={center} zoom={zoom} />

        {/* User / District Location Marker */}
        <Marker position={center} icon={LOCATION_PIN_ICON}>
          <Popup className="wgpt-popup">
            <div className="text-xs font-sans p-1.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <strong className="text-slate-900 font-bold block text-xs">
                  {locationSource === "gps" ? "Current GPS Fix" : `${selectedDistrict} District`}
                </strong>
              </div>
              <p className="text-slate-600 font-mono text-[11px]">
                {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E
              </p>
              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                Tamil Nadu, India
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

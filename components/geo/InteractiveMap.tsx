"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { OfficialAlert } from "@/types";
import type { AlertVerificationReport } from "@/types/alerts-normalized";
import type { DistrictIntelligence } from "@/types/district";
import { AlertMarkerPopup } from "./AlertMarkerPopup";
import {
  getRiskZoneStyle,
  generateSubdivisionCoords,
} from "./RiskZoneMarker";
import { MapLegend } from "./MapLegend";
import { DISTRICT_COORDINATES } from "@/lib/geo/districtCoordinates";

// ---------------------------------------------------------------------------
// Custom Leaflet Icons (inline SVG data URIs to avoid missing image issues)
// ---------------------------------------------------------------------------

const USER_ICON = new L.DivIcon({
  className: "wgpt-user-marker",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const DISTRICT_ICON = new L.DivIcon({
  className: "wgpt-district-marker",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#06b6d4;border:2px solid #fff;box-shadow:0 0 8px rgba(6,182,212,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const ALERT_ICON = new L.DivIcon({
  className: "wgpt-alert-marker",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#7c3aed;border:3px solid #c4b5fd;box-shadow:0 0 14px rgba(124,58,237,0.6);display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// ---------------------------------------------------------------------------
// Map Recenter Helper Component
// ---------------------------------------------------------------------------

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);
  return null;
}

// ---------------------------------------------------------------------------
// Interactive Map Props
// ---------------------------------------------------------------------------

type InteractiveMapProps = {
  center: [number, number];
  zoom: number;
  /** User GPS position (if available) */
  userPosition: { lat: number; lon: number } | null;
  /** Currently selected district name */
  selectedDistrict: string;
  /** District intelligence for subdivision risk zones */
  districtIntel: DistrictIntelligence | null;
  /** Verified official alerts with reports */
  verifiedAlerts: Array<{ alert: OfficialAlert; report: AlertVerificationReport }>;
  /** Overall district risk score for center marker */
  districtRiskScore: number;
};

export function InteractiveMap({
  center,
  zoom,
  userPosition,
  selectedDistrict,
  districtIntel,
  verifiedAlerts,
  districtRiskScore,
}: InteractiveMapProps) {
  // Generate subdivision markers from district intelligence
  const districtCoord = DISTRICT_COORDINATES[selectedDistrict];
  const subdivisionZones = districtIntel
    ? generateSubdivisionCoords(
        districtCoord?.lat ?? center[0],
        districtCoord?.lon ?? center[1],
        districtIntel.affectedAreas
      )
    : [];

  // District center risk style
  const districtRiskStyle = getRiskZoneStyle(
    districtRiskScore >= 80 ? "severe" :
    districtRiskScore >= 60 ? "high" :
    districtRiskScore >= 40 ? "elevated" :
    districtRiskScore >= 20 ? "moderate" : "low"
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl" style={{ height: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* High-Legibility Map Tiles — CartoDB Voyager / OpenStreetMap (Free, Legal, Zero API Key) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Recenter on center/zoom change */}
        <MapRecenter center={center} zoom={zoom} />

        {/* District Center Risk Circle */}
        {districtCoord && (
          <Circle
            center={[districtCoord.lat, districtCoord.lon]}
            radius={districtRiskStyle.radius * 2}
            pathOptions={{
              color: districtRiskStyle.color,
              fillColor: districtRiskStyle.fillColor,
              fillOpacity: districtRiskStyle.fillOpacity * 0.6,
              weight: 1,
            }}
          />
        )}

        {/* District Center Marker */}
        {districtCoord && (
          <Marker position={[districtCoord.lat, districtCoord.lon]} icon={DISTRICT_ICON}>
            <Popup>
              <div style={{ color: "#e2e8f0", fontSize: 11, minWidth: 160 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 12, marginBottom: 4 }}>
                  📌 {selectedDistrict} District
                </div>
                <div style={{ color: "#94a3b8", fontSize: 10 }}>
                  Risk Score: {districtRiskScore}/100
                </div>
                {districtIntel && (
                  <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>
                    Hazard: {districtIntel.dominantHazard || districtIntel.primaryHazard}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Subdivision Risk Zone Circles */}
        {subdivisionZones.map((zone) => {
          const style = getRiskZoneStyle(zone.riskLevel);
          return (
            <React.Fragment key={zone.name}>
              <Circle
                center={[zone.lat, zone.lon]}
                radius={style.radius}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fillColor,
                  fillOpacity: style.fillOpacity,
                  weight: 1,
                }}
              />
              <Marker
                position={[zone.lat, zone.lon]}
                icon={new L.DivIcon({
                  className: "wgpt-zone-label",
                  html: `<div style="font-size:9px;font-weight:700;color:${style.color};text-shadow:0 1px 3px rgba(0,0,0,0.8);white-space:nowrap;pointer-events:none;">${zone.name}</div>`,
                  iconSize: [120, 16],
                  iconAnchor: [60, 8],
                })}
              >
                <Popup>
                  <div style={{ color: "#e2e8f0", fontSize: 11, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 12, marginBottom: 2 }}>{zone.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: 10 }}>{zone.subdivision}</div>
                    <div style={{ color: style.color, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                      Risk: {zone.riskLevel.toUpperCase()}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>{zone.disruptionLevel}</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Verified Alert Markers */}
        {verifiedAlerts
          .filter((v) => v.report.isVerifiedOfficial)
          .map((v) => {
            const coord = DISTRICT_COORDINATES[v.alert.district];
            if (!coord) return null;
            // Offset slightly from center to avoid overlap
            const offsetLat = coord.lat + 0.015;
            const offsetLon = coord.lon + 0.015;
            return (
              <Marker key={v.alert.id} position={[offsetLat, offsetLon]} icon={ALERT_ICON}>
                <Popup>
                  <AlertMarkerPopup alert={v.alert} report={v.report} />
                </Popup>
              </Marker>
            );
          })}

        {/* User GPS Position Marker */}
        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lon]} icon={USER_ICON}>
            <Popup>
              <div style={{ color: "#e2e8f0", fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: "#3b82f6", fontSize: 12, marginBottom: 2 }}>
                  📍 Your Location (GPS)
                </div>
                <div style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 10 }}>
                  {userPosition.lat.toFixed(4)}°N, {userPosition.lon.toFixed(4)}°E
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <MapLegend />

      {/* Approximate Zone Notice */}
      <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/60 px-3 py-1.5 text-[9px] text-slate-400 font-mono">
        Risk zones are approximate
      </div>
    </div>
  );
}

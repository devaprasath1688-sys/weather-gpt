"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Clean high-contrast monochrome location pin
const LOCATION_PIN_ICON = new L.DivIcon({
  className: "wgpt-location-pin",
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative;width:14px;height:14px;border-radius:50%;background:#ffffff;border:2.5px solid #000000;box-shadow:0 2px 8px rgba(0,0,0,0.8);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);
  return null;
}

type LeafletFallbackMapProps = {
  center: [number, number];
  zoom: number;
  selectedDistrict: string;
};

export function LeafletFallbackMap({ center, zoom, selectedDistrict }: LeafletFallbackMapProps) {
  return (
    <div className="relative h-full w-full bg-neutral-950">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", background: "#09090b" }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Esri World Imagery (Satellite) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {/* CartoDB Reference Labels (Roads, Boundaries & Place Names) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Recenter smooth transition */}
        <MapRecenter center={center} zoom={zoom} />

        {/* ONE Clean User Location Marker */}
        <Marker position={center} icon={LOCATION_PIN_ICON}>
          <Popup className="wgpt-popup">
            <div className="text-xs font-mono p-1">
              <strong className="block text-black">{selectedDistrict} Location</strong>
              <span className="text-neutral-600">{center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

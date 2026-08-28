"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Crosshair, Clock } from "lucide-react";
import { DISTRICT_COORDINATES } from "@/lib/geo/districtCoordinates";

// High-resolution satellite & hybrid fallback map when Google Maps API key is absent/unavailable
const LeafletFallbackMap = dynamic(
  () => import("./LeafletFallbackMap").then((mod) => mod.LeafletFallbackMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[#040810] text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
      </div>
    ),
  }
);

declare global {
  interface Window {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    google?: any;
    gm_authFailure?: () => void;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

type LiveWeatherMapProps = {
  selectedDistrict: string;
  gpsCoordinates: { lat: number; lon: number } | null;
  locationSource: "gps" | "manual";
  updatedAt?: string;
  onUseGPS?: () => void;
  gpsLoading?: boolean;
};

export function LiveWeatherMap({
  selectedDistrict,
  gpsCoordinates,
  locationSource,
  updatedAt,
  onUseGPS,
  gpsLoading = false,
}: LiveWeatherMapProps) {
  const googleMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(null);

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Resolved coordinates
  const districtCoord = DISTRICT_COORDINATES[selectedDistrict] || {
    lat: 13.0827,
    lon: 80.2707,
    state: "Tamil Nadu",
    label: selectedDistrict,
  };

  const activeLat = gpsCoordinates?.lat ?? districtCoord.lat;
  const activeLon = gpsCoordinates?.lon ?? districtCoord.lon;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Catch Google Maps auth failure gracefully
  useEffect(() => {
    window.gm_authFailure = () => {
      Promise.resolve().then(() => setGoogleMapsError(true));
    };
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  // Load official Google Maps API script if API key is configured
  useEffect(() => {
    if (!apiKey) {
      return;
    }

    if (window.google?.maps) {
      Promise.resolve().then(() => setGoogleMapsLoaded(true));
      return;
    }

    const scriptId = "google-maps-js-sdk";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => setGoogleMapsError(true);
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => setGoogleMapsLoaded(true));
      existingScript.addEventListener("error", () => setGoogleMapsError(true));
    }
  }, [apiKey]);

  // Initialize and update Google Map instance in HYBRID mode
  useEffect(() => {
    if (!googleMapsLoaded || !googleMapRef.current || !window.google?.maps) return;

    try {
      const locationTitle = locationSource === "gps" ? "Your Current Location" : `${selectedDistrict} District Center`;

      if (!mapInstanceRef.current) {
        // Initialize with Google Maps HYBRID mode (Satellite + Roads + Labels)
        const map = new window.google.maps.Map(googleMapRef.current, {
          center: { lat: activeLat, lng: activeLon },
          zoom: 13,
          mapTypeId: window.google.maps.MapTypeId.HYBRID,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [
              window.google.maps.MapTypeId.HYBRID,
              window.google.maps.MapTypeId.SATELLITE,
              window.google.maps.MapTypeId.ROADMAP,
            ],
          },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          scaleControl: true,
          rotateControl: true,
          clickableIcons: true,
        });

        // ONE Clean User Location Marker
        const marker = new window.google.maps.Marker({
          position: { lat: activeLat, lng: activeLon },
          map,
          title: locationTitle,
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;font-size:12px;color:#111;padding:4px 6px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${locationTitle}</div>
              <div style="color:#666;font-size:11px;">${activeLat.toFixed(4)}°N, ${activeLon.toFixed(4)}°E</div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
        infoWindowRef.current = infoWindow;
      } else {
        const newPos = { lat: activeLat, lng: activeLon };
        mapInstanceRef.current.panTo(newPos);
        markerInstanceRef.current?.setPosition(newPos);
        markerInstanceRef.current?.setTitle(locationTitle);

        infoWindowRef.current?.setContent(`
          <div style="font-family:sans-serif;font-size:12px;color:#111;padding:4px 6px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${locationTitle}</div>
            <div style="color:#666;font-size:11px;">${activeLat.toFixed(4)}°N, ${activeLon.toFixed(4)}°E</div>
          </div>
        `);
      }
    } catch {
      Promise.resolve().then(() => setGoogleMapsError(true));
    }
  }, [googleMapsLoaded, activeLat, activeLon, selectedDistrict, locationSource]);

  const isUsingGoogleMaps = Boolean(apiKey) && googleMapsLoaded && !googleMapsError;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#142a47] bg-[#07111e] shadow-xl">
      {/* Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#142a47] bg-[#07111e]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                LIVE WEATHER MAP · {selectedDistrict} District
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono text-sky-300 bg-[#0a1628] border border-sky-500/20 px-2 py-0.5 rounded-full">
                {activeLat.toFixed(4)}°N, {activeLon.toFixed(4)}°E
              </span>
            </div>
            {updatedAt && (
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>Updated {updatedAt}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onUseGPS && (
            <button
              type="button"
              onClick={onUseGPS}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142a47] bg-[#0a1628] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#0f223d] hover:border-sky-500/40 hover:text-white transition-colors disabled:opacity-50"
            >
              {gpsLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
              ) : (
                <Crosshair className="h-3.5 w-3.5 text-sky-400" />
              )}
              <span>{locationSource === "gps" ? "GPS Active" : "Detect via GPS"}</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-sky-300 bg-[#0a1628] border border-sky-500/30 px-2.5 py-1.5 rounded-lg shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>{isUsingGoogleMaps ? "Google Hybrid Mode" : "Satellite & Roads View"}</span>
          </span>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full bg-[#040810]">
        {isUsingGoogleMaps ? (
          <div ref={googleMapRef} className="h-full w-full" />
        ) : (
          <LeafletFallbackMap
            center={[activeLat, activeLon]}
            zoom={13}
            selectedDistrict={selectedDistrict}
          />
        )}

        {/* Location Badge Overlay */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="rounded-xl border border-sky-500/30 bg-[#07111e]/90 backdrop-blur-md px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-white leading-none">
                {locationSource === "gps" ? "Your Location (GPS)" : `${selectedDistrict} District`}
              </p>
              <p className="text-[10px] text-sky-300/70 font-mono mt-0.5">
                {activeLat.toFixed(4)}°N, {activeLon.toFixed(4)}°E · Tamil Nadu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

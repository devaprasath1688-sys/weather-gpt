"use client";

import { useState, useCallback, useRef } from "react";

export type GeoPermissionState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type UseGeolocationReturn = {
  /** Current permission/request state */
  permissionState: GeoPermissionState;
  /** Resolved coordinates (null until granted) */
  position: GeolocationResult | null;
  /** Human-readable error message */
  errorMessage: string | null;
  /** Request geolocation from the browser */
  requestLocation: () => void;
  /** Clear current position and reset to idle */
  clearPosition: () => void;
};

/**
 * Browser Geolocation API hook with full permission state machine.
 * GPS is opt-in only — never auto-requests on mount.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [permissionState, setPermissionState] = useState<GeoPermissionState>("idle");
  const [position, setPosition] = useState<GeolocationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("unavailable");
      setErrorMessage("Geolocation is not supported by your browser. Please select a district manually.");
      return;
    }

    setPermissionState("requesting");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionState("granted");
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setErrorMessage(null);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionState("denied");
            setErrorMessage("Location permission denied. You can select a district manually below.");
            break;
          case err.POSITION_UNAVAILABLE:
            setPermissionState("unavailable");
            setErrorMessage("Location information unavailable. Please select a district manually.");
            break;
          case err.TIMEOUT:
            setPermissionState("unavailable");
            setErrorMessage("Location request timed out. Please try again or select a district manually.");
            break;
          default:
            setPermissionState("unavailable");
            setErrorMessage("An unknown geolocation error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const clearPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setPosition(null);
    setPermissionState("idle");
    setErrorMessage(null);
  }, []);

  return { permissionState, position, errorMessage, requestLocation, clearPosition };
}

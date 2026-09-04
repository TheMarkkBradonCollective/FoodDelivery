"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function useLeafletFix() {
  useEffect(() => {
    // Fix default marker icons in webpack/next
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);
}

export function createCoverageIcon(color: string, label?: string) {
  return L.divIcon({
    className: "runr-marker",
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: 700;
    ">${label ?? ""}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function createUserIcon() {
  return L.divIcon({
    className: "runr-user-marker",
    html: `<div style="
      width: 16px;
      height: 16px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(59,130,246,0.25);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function createRunrIcon(status: "available" | "busy" = "available") {
  const color = status === "available" ? "#22C55E" : "#F97316";
  return L.divIcon({
    className: "runr-driver-marker",
    html: `<div style="
      width: 28px;
      height: 28px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

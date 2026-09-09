"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "../../types/index";

export const MAP_TILES = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const;

export function useLeafletFix() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "",
      iconUrl: "",
      shadowUrl: "",
    });
  }, []);
}

function contrastOn(color: string) {
  const c = color.replace("#", "").toLowerCase();
  if (c === "a0f878" || c === "f6f1e8") return "#1A1224";
  return "#F6F1E8";
}

export function createPlaceIcon(color: string, label?: string) {
  const ink = contrastOn(color);
  const text = label
    ? `<text x="16" y="18.5" text-anchor="middle" font-size="9" font-weight="800" font-family="Plus Jakarta Sans, Inter, sans-serif" fill="${ink}">${label}</text>`
    : `<circle cx="16" cy="16" r="4.5" fill="${ink}"/>`;

  return L.divIcon({
    className: "runr-pin",
    html: `<svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true">
      <path d="M16 1.6c7.6 0 13.8 6 13.8 13.4 0 9.6-13.8 23-13.8 23S2.2 24.6 2.2 15C2.2 7.6 8.4 1.6 16 1.6z" fill="${color}" stroke="#F6F1E8" stroke-width="2.2"/>
      ${text}
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -32],
  });
}

export function createUserIcon() {
  return L.divIcon({
    className: "runr-puck",
    html: `<span class="runr-puck-pulse"></span><span class="runr-puck-core"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function createRunrIcon(status: "available" | "busy" = "available") {
  return createPlaceIcon(status === "available" ? "#A0F878" : "#7048F8");
}

export function routeArc(from: Coordinates, to: Coordinates, steps = 28): [number, number][] {
  const midLat = (from.lat + to.lat) / 2;
  const midLng = (from.lng + to.lng) / 2;
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const bulge = 0.18;
  const cx = midLng - dy * bulge;
  const cy = midLat + dx * bulge;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const lat = u * u * from.lat + 2 * u * t * cy + t * t * to.lat;
    const lng = u * u * from.lng + 2 * u * t * cx + t * t * to.lng;
    pts.push([lat, lng]);
  }
  return pts;
}

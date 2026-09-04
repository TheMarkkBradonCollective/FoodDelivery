"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useLeafletFix, createCoverageIcon, createUserIcon } from "./map-utils";
import type { Coordinates } from "../../types/index";

export interface MapMarker {
  id: string;
  position: Coordinates;
  color: string;
  label?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

export interface MapViewProps {
  center: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  userLocation?: Coordinates;
  onRecenter?: () => void;
  className?: string;
  dark?: boolean;
}

function RecenterControl({
  center,
  zoom,
}: {
  center: Coordinates;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

export function MapView({
  center,
  zoom = 14,
  markers = [],
  showUserLocation = true,
  userLocation,
  className,
  dark = false,
}: MapViewProps) {
  useLeafletFix();

  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const userPos = userLocation ?? center;

  const markerIcons = useMemo(
    () =>
      markers.reduce<Record<string, ReturnType<typeof createCoverageIcon>>>(
        (acc, m) => {
          acc[m.id] = createCoverageIcon(m.color, m.label);
          return acc;
        },
        {}
      ),
    [markers]
  );

  return (
    <div className={className ?? "h-full w-full"}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <RecenterControl center={center} zoom={zoom} />

        {showUserLocation && (
          <Marker
            position={[userPos.lat, userPos.lng]}
            icon={createUserIcon()}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={markerIcons[marker.id]}
            eventHandlers={{
              click: () => marker.onClick?.(),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{marker.title}</p>
                {marker.subtitle && (
                  <p className="text-gray-600">{marker.subtitle}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

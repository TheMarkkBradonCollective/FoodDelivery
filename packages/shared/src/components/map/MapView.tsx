"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  MAP_TILES,
  createPlaceIcon,
  createUserIcon,
  routeArc,
  useLeafletFix,
} from "./map-utils";
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
  route?: { from: Coordinates; to: Coordinates };
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

function FitRoute({ from, to }: { from: Coordinates; to: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      { padding: [56, 56], maxZoom: 15, animate: true },
    );
  }, [from.lat, from.lng, to.lat, to.lng, map]);
  return null;
}

export function MapView({
  center,
  zoom = 14,
  markers = [],
  showUserLocation = true,
  userLocation,
  route,
  className,
  dark = false,
}: MapViewProps) {
  useLeafletFix();

  const userPos = userLocation ?? center;
  const path = useMemo(
    () => (route ? routeArc(route.from, route.to) : null),
    [route],
  );

  const markerIcons = useMemo(
    () =>
      markers.reduce<Record<string, ReturnType<typeof createPlaceIcon>>>((acc, m) => {
        acc[m.id] = createPlaceIcon(m.color, m.label);
        return acc;
      }, {}),
    [markers],
  );

  return (
    <div className={className ?? "h-full w-full"}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className={`runr-map h-full w-full ${dark ? "runr-map--dark" : "runr-map--light"}`}
        zoomControl={false}
        attributionControl={false}
        preferCanvas
      >
        <TileLayer
          url={dark ? MAP_TILES.dark : MAP_TILES.light}
          subdomains="abcd"
          maxZoom={19}
        />
        {route ? <FitRoute from={route.from} to={route.to} /> : <RecenterControl center={center} zoom={zoom} />}

        {path ? (
          <>
            <Polyline
              positions={path}
              pathOptions={{
                color: dark ? "#1A1224" : "#F6F1E8",
                weight: 10,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={path}
              pathOptions={{
                color: "#7048F8",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        ) : null}

        {showUserLocation && (
          <>
            <Circle
              center={[userPos.lat, userPos.lng]}
              radius={110}
              pathOptions={{
                color: "#7048F8",
                fillColor: "#A0F878",
                fillOpacity: dark ? 0.16 : 0.18,
                weight: 0,
              }}
            />
            <Marker position={[userPos.lat, userPos.lng]} icon={createUserIcon()} />
          </>
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
            <Popup className="runr-map-popup">
              <div>
                <p className="font-extrabold">{marker.title}</p>
                {marker.subtitle ? <p className="mt-0.5 text-xs opacity-75">{marker.subtitle}</p> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon } from "leaflet";
import type { Catch } from "@/types/home";

type LeafletCatchesMapProps = {
  catches: Catch[];
};

const defaultCenter: [number, number] = [59.3293, 18.0686];

function getYearFromCatch(item: Catch): number {
  const raw = item.catch_date || item.created_at || "";
  const date = new Date(raw);
  const year = date.getFullYear();

  if (Number.isNaN(year)) {
    return new Date().getFullYear();
  }

  return year;
}

function getYearColor(year: number) {
  if (year >= 2026) {
    return {
      bg: "#1d4ed8",
      ring: "#dbeafe",
      text: "#ffffff",
    };
  }

  if (year === 2025) {
    return {
      bg: "#16a34a",
      ring: "#dcfce7",
      text: "#ffffff",
    };
  }

  if (year === 2024) {
    return {
      bg: "#d97706",
      ring: "#fef3c7",
      text: "#ffffff",
    };
  }

  return {
    bg: "#6b7280",
    ring: "#e5e7eb",
    text: "#ffffff",
  };
}

function createMarkerIcon(year: number) {
  const color = getYearColor(year);

  return divIcon({
    className: "custom-catch-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: ${color.bg};
        border: 4px solid ${color.ring};
        box-shadow: 0 4px 10px rgba(0,0,0,0.22);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function createClusterCustomIcon(cluster: any) {
  return divIcon({
    html: `
      <div style="
        background:#324b2f;
        color:#ffffff;
        width:44px;
        height:44px;
        border-radius:9999px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
        border:4px solid #e7dfd1;
        box-shadow:0 6px 16px rgba(0,0,0,0.20);
      ">
        ${cluster.getChildCount()}
      </div>
    `,
    className: "custom-marker-cluster",
    iconSize: [44, 44],
  });
}

function getFishLabel(item: Catch) {
  if (item.fish_type === "Fina fisken" && item.fine_fish_type) {
    return `Fina fisken (${item.fine_fish_type})`;
  }

  return item.fish_type;
}

function getWeightLabel(weight: number) {
  return weight >= 1000 ? `${(weight / 1000).toFixed(2)} kg` : `${weight} g`;
}

export default function LeafletCatchesMap({
  catches,
}: LeafletCatchesMapProps) {
  const catchesWithCoords = useMemo(
    () =>
      catches.filter(
        (item) =>
          typeof item.latitude === "number" &&
          typeof item.longitude === "number"
      ),
    [catches]
  );

  const center = useMemo<[number, number]>(() => {
    if (catchesWithCoords.length > 0) {
      return [
        catchesWithCoords[0].latitude as number,
        catchesWithCoords[0].longitude as number,
      ];
    }

    return defaultCenter;
  }, [catchesWithCoords]);

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      className="h-[420px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
      >
        {catchesWithCoords.map((item) => {
          const year = getYearFromCatch(item);

          return (
            <Marker
              key={item.id}
              position={[item.latitude as number, item.longitude as number]}
              icon={createMarkerIcon(year)}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[240px]">
                  {item.image_url ? (
                    <a
                      href={item.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-3 block overflow-hidden rounded-xl border border-[#d8d2c7]"
                    >
                      <img
                        src={item.image_url}
                        alt={`${item.caught_for} - ${getFishLabel(item)}`}
                        className="h-[120px] w-full object-cover transition hover:scale-[1.02]"
                      />
                    </a>
                  ) : null}

                  <div className="font-bold text-[#1f2937]">{item.caught_for}</div>

                  <div className="text-sm text-[#4b5563]">
                    {getFishLabel(item)}
                  </div>

                  <div className="text-sm text-[#4b5563]">
                    {getWeightLabel(item.weight_g)}
                  </div>

                  {item.location_name ? (
                    <div className="text-sm text-[#6b7280]">
                      {item.location_name}
                    </div>
                  ) : null}

                  <div className="text-sm text-[#6b7280]">
                    {new Date(item.catch_date).toLocaleDateString("sv-SE")}
                  </div>

                  <div
                    className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: getYearColor(year).ring,
                      color: getYearColor(year).bg,
                    }}
                  >
                    År {year}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

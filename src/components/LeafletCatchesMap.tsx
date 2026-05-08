"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon } from "leaflet";
import type { Catch, FishingSpot } from "@/types/home";
import type { FishingSpotMapFilter } from "@/types/fishing-spots";
import {
  identifyWaterBody,
  WATER_ACHIEVEMENT_MAX_DISTANCE_M,
  type WaterIdentificationResult,
} from "@/lib/water-identification";

type LeafletCatchesMapProps = {
  catches: Catch[];
  fishingSpots?: FishingSpot[];
  filter?: FishingSpotMapFilter;
};

const defaultCenter: [number, number] = [59.3293, 18.0686];

function formatDistance(distanceM: number | null) {
  if (distanceM === null) {
    return null;
  }

  if (distanceM < 1) {
    return "0 m";
  }

  if (distanceM < 1000) {
    return `${Math.round(distanceM)} m`;
  }

  return `${(distanceM / 1000).toFixed(1)} km`;
}

function getWaterStatusText(
  water: WaterIdentificationResult | null,
  loading: boolean
) {
  if (loading) {
    return "Identifierar vatten...";
  }

  if (!water) {
    return "Tryck på en sjö i kartan för att testa vattenidentifiering.";
  }

  if (water.found && water.name) {
    if (water.achievementEligible) {
      return `Vatten: ${water.name}`;
    }

    const distance = formatDistance(water.distanceM);

    if (distance) {
      return `Närmaste vatten: ${water.name} (${distance} bort, räknas inte för achievements över ${WATER_ACHIEVEMENT_MAX_DISTANCE_M} m).`;
    }

    return `Närmaste vatten: ${water.name} (räknas inte för achievements).`;
  }

  if (water.setupRequired) {
    return "Vattenidentifiering kunde inte köras just nu.";
  }

  return "Ingen sjö identifierad nära denna punkt.";
}

function WaterClickIdentifier({
  onResult,
  onLoadingChange,
}: {
  onResult: (value: WaterIdentificationResult | null) => void;
  onLoadingChange: (value: boolean) => void;
}) {
  useMapEvents({
    click(event) {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;

      onResult(null);
      onLoadingChange(true);

      identifyWaterBody(lat, lng)
        .then((result) => {
          onResult(result);
        })
        .catch(() => {
          onResult({
            found: false,
            name: null,
            waterKey: null,
            source: null,
            distanceM: null,
            achievementEligible: false,
            matchType: null,
            message: "Kunde inte identifiera vatten just nu.",
          });
        })
        .finally(() => {
          onLoadingChange(false);
        });
    },
  });

  return null;
}

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

function createCatchMarkerIcon(year: number) {
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

function createFishingSpotMarkerIcon() {
  return divIcon({
    className: "custom-fishing-spot-marker",
    html: `
      <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #7c3aed;
          border: 4px solid #ede9fe;
          box-shadow: 0 4px 10px rgba(0,0,0,0.22);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function createClusterCustomIcon(cluster: { getChildCount: () => number }) {
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
  fishingSpots = [],
  filter = "all",
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

  const spotsWithCoords = useMemo(
    () =>
      fishingSpots.filter(
        (item) =>
          typeof item.latitude === "number" &&
          typeof item.longitude === "number"
      ),
    [fishingSpots]
  );

  const visibleCatches = useMemo(
    () => (filter === "spots" ? [] : catchesWithCoords),
    [catchesWithCoords, filter]
  );

  const visibleSpots = useMemo(
    () => (filter === "catches" ? [] : spotsWithCoords),
    [filter, spotsWithCoords]
  );

  const [identifiedWater, setIdentifiedWater] =
    useState<WaterIdentificationResult | null>(null);
  const [waterLoading, setWaterLoading] = useState(false);

  const center = useMemo<[number, number]>(() => {
    if (visibleSpots.length > 0) {
      return [visibleSpots[0].latitude, visibleSpots[0].longitude];
    }

    if (visibleCatches.length > 0) {
      return [
        visibleCatches[0].latitude as number,
        visibleCatches[0].longitude as number,
      ];
    }

    return defaultCenter;
  }, [visibleCatches, visibleSpots]);

  return (
    <div>
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

        <WaterClickIdentifier
          onResult={setIdentifiedWater}
          onLoadingChange={setWaterLoading}
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {visibleCatches.map((item) => {
            const year = getYearFromCatch(item);

            return (
              <Marker
                key={`catch-${item.id}`}
                position={[item.latitude as number, item.longitude as number]}
                icon={createCatchMarkerIcon(year)}
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

                    <div className="font-bold text-[#1f2937]">
                      {item.caught_for}
                    </div>

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

          {visibleSpots.map((spot) => (
            <Marker
              key={`spot-${spot.id}`}
              position={[spot.latitude, spot.longitude]}
              icon={createFishingSpotMarkerIcon()}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[260px]">
                  <div className="font-bold text-[#1f2937]">
                    {spot.title?.trim() || "Fiskeplats"}
                  </div>

                  <div className="mt-1 text-sm text-[#4b5563]">
                    Markerad av {spot.created_by_name}
                  </div>

                  {spot.notes?.trim() ? (
                    <div className="mt-3 rounded-xl border border-[#e9e4dc] bg-[#faf8f4] px-3 py-2 text-sm text-[#4b5563]">
                      {spot.notes}
                    </div>
                  ) : null}

                  <div className="mt-3 text-sm text-[#6b7280]">
                    {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                  </div>

                  <div className="mt-2 inline-flex rounded-full bg-[#ede9fe] px-2.5 py-1 text-xs font-semibold text-[#6d28d9]">
                    Fiskeplats
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div className="border-t border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#374151]">
        <span className="font-semibold text-[#1f2937]">Vattenstatus: </span>
        {getWaterStatusText(identifiedWater, waterLoading)}
      </div>
    </div>
  );
}

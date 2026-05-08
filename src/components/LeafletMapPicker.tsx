"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  identifyWaterBody,
  type WaterIdentificationResult,
} from "@/lib/water-identification";

type LeafletMapPickerProps = {
  onSelect: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
};

const defaultCenter: [number, number] = [59.3293, 18.0686];

function getWaterStatusText(
  water: WaterIdentificationResult | null,
  loading: boolean
) {
  if (loading) {
    return "Identifierar vatten...";
  }

  if (!water) {
    return "Tryck på kartan för att markera plats. Om vattenidentifiering är aktiverad visas sjönamnet här.";
  }

  if (water.found && water.name) {
    if (water.achievementEligible) {
      return `Vatten: ${water.name}`;
    }

    if (typeof water.distanceM === "number") {
      return `Närmaste vatten: ${water.name} (${Math.round(
        water.distanceM
      )} m bort, räknas inte för achievement)`;
    }

    return `Närmaste vatten: ${water.name} (räknas inte för achievement)`;
  }

  if (water.setupRequired) {
    return "Vattenidentifiering kunde inte köras just nu.";
  }

  return "Inget vatten identifierat på denna punkt.";
}

function ClickHandler({
  onSelect,
  position,
  setPosition,
  setWater,
  setWaterLoading,
}: {
  onSelect: (lat: number, lng: number) => void;
  position: [number, number] | null;
  setPosition: (value: [number, number]) => void;
  setWater: (value: WaterIdentificationResult | null) => void;
  setWaterLoading: (value: boolean) => void;
}) {
  useMapEvents({
    click(event) {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      const controller = new AbortController();

      setPosition([lat, lng]);
      setWater(null);
      setWaterLoading(true);
      onSelect(lat, lng);

      identifyWaterBody(lat, lng, controller.signal)
        .then((result) => {
          setWater(result);
        })
        .catch(() => {
          setWater({
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
          setWaterLoading(false);
        });
    },
  });

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function LeafletMapPicker({
  onSelect,
  selectedPosition = null,
}: LeafletMapPickerProps) {
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(
    null
  );
  const [water, setWater] = useState<WaterIdentificationResult | null>(null);
  const [waterLoading, setWaterLoading] = useState(false);

  const position = clickedPosition ?? selectedPosition;
  const center = position ?? defaultCenter;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8d2c7]">
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

        <ClickHandler
          onSelect={onSelect}
          position={position}
          setPosition={setClickedPosition}
          setWater={setWater}
          setWaterLoading={setWaterLoading}
        />
      </MapContainer>

      <div className="border-t border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#374151]">
        <span className="font-semibold text-[#1f2937]">Vattenstatus: </span>
        {getWaterStatusText(water, waterLoading)}
      </div>
    </div>
  );
}
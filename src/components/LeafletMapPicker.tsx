"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type LeafletMapPickerProps = {
  onSelect: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
};

const defaultCenter: [number, number] = [59.3293, 18.0686];

function ClickHandler({
  onSelect,
  position,
  setPosition,
}: {
  onSelect: (lat: number, lng: number) => void;
  position: [number, number] | null;
  setPosition: (value: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;

      setPosition([lat, lng]);
      onSelect(lat, lng);
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
  const [position, setPosition] = useState<[number, number] | null>(selectedPosition);

  useEffect(() => {
    setPosition(selectedPosition);
  }, [selectedPosition]);

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
          setPosition={setPosition}
        />
      </MapContainer>
    </div>
  );
}

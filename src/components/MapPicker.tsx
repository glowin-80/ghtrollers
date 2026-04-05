"use client";

import dynamic from "next/dynamic";

type MapPickerProps = {
  onSelect: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
};

const LeafletMapPicker = dynamic(() => import("./LeafletMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-[#d8d2c7] bg-white text-[#6b7280]">
      Laddar karta...
    </div>
  ),
});

export default function MapPicker({
  onSelect,
  selectedPosition = null,
}: MapPickerProps) {
  return (
    <LeafletMapPicker onSelect={onSelect} selectedPosition={selectedPosition} />
  );
}

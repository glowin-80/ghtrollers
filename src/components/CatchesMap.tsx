"use client";

import dynamic from "next/dynamic";
import type { Catch } from "@/types/home";

type CatchesMapProps = {
  catches: Catch[];
};

const LeafletCatchesMap = dynamic(() => import("./LeafletCatchesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-[#d8d2c7] bg-white text-[#6b7280]">
      Laddar karta...
    </div>
  ),
});

export default function CatchesMap({ catches }: CatchesMapProps) {
  return <LeafletCatchesMap catches={catches} />;
}

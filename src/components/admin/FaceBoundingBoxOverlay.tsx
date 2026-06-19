"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { BoundingBox } from "@/types";

function toPercentage(value: number) {
  return Math.min(100, Math.max(0, value > 1 ? value : value * 100));
}

export function FaceBoundingBoxOverlay({
  src,
  alt,
  boundingBox,
  confidence,
}: {
  src?: string | null;
  alt: string;
  boundingBox: BoundingBox;
  confidence: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-zinc-950 p-6 text-center text-sm font-bold text-zinc-300">
        Imagem indisponível para revisão
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-zinc-950">
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        onError={() => setFailed(true)}
      />
      <div
        aria-label={`Rosto sugerido com ${Math.round(confidence * 100)}% de confiança`}
        className="pointer-events-none absolute border-2 border-[#f0c35d] shadow-[0_0_0_1px_rgba(0,0,0,0.7)]"
        style={{
          left: `${toPercentage(boundingBox.x)}%`,
          top: `${toPercentage(boundingBox.y)}%`,
          width: `${toPercentage(boundingBox.width)}%`,
          height: `${toPercentage(boundingBox.height)}%`,
        }}
      >
        <span className="absolute -top-7 left-0 whitespace-nowrap bg-[#d1a137] px-2 py-1 text-[10px] font-black text-black">
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}

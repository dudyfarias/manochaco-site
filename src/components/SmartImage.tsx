/* eslint-disable @next/next/no-img-element */
import Image, { type ImageProps } from "next/image";
import { getInitials, hasPublicAsset, isRemoteAsset } from "@/lib/assets";

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  fallbackText?: string;
};

export function SmartImage({
  src,
  alt,
  fallbackLabel = "Manochaco",
  fallbackText,
  className = "",
  fill,
  width,
  height,
  style,
  priority,
  ...props
}: SmartImageProps) {
  if (hasPublicAsset(src)) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        style={style}
        priority={priority}
        className={className}
        {...props}
      />
    );
  }

  if (isRemoteAsset(src)) {
    return (
      <img
        src={src as string}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full items-center justify-center bg-zinc-950 text-center ${
        fill ? "absolute inset-0" : ""
      } ${className}`}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 border border-[#b9872a]/30 bg-[linear-gradient(135deg,#050505_0%,#161616_52%,#2b210e_100%)] p-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#d1a137] bg-black text-3xl font-black text-[#f0c35d]">
          {getInitials(fallbackLabel)}
        </div>
        <div>
          <p className="text-sm font-black uppercase text-[#f0c35d]">
            {fallbackLabel}
          </p>
          <p className="mt-2 text-xs font-semibold text-zinc-300">
            {fallbackText ?? "Imagem em breve"}
          </p>
        </div>
      </div>
    </div>
  );
}

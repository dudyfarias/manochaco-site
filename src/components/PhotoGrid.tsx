import type { Photo } from "@/types";
import { PhotoCard } from "./PhotoCard";

type PhotoGridProps = {
  photos: Photo[];
  tone?: "light" | "dark";
  featured?: boolean;
};

export function PhotoGrid({
  photos,
  tone = "light",
  featured = false,
}: PhotoGridProps) {
  const isDark = tone === "dark";

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          dark={isDark}
          featured={featured && index === 0}
        />
      ))}
    </div>
  );
}

import Image from "next/image";
import { formatDate } from "@/lib/format";
import type { Album } from "@/types";

type AlbumCardProps = {
  album: Album;
};

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-zinc-950">
        <Image
          src={album.coverImage}
          alt={`Capa do álbum ${album.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase text-[#9a6a12]">
          {formatDate(album.date)}
        </p>
        <h3 className="mt-2 text-xl font-black text-zinc-950">{album.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {album.description}
        </p>
        <p className="mt-4 text-sm font-bold text-zinc-950">
          {album.photoIds.length} foto{album.photoIds.length === 1 ? "" : "s"}
        </p>
      </div>
    </article>
  );
}

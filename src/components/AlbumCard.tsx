import Link from "next/link";
import { formatDate } from "@/lib/format";
import { photoCategoryLabels } from "@/lib/photos";
import type { Album } from "@/types";
import { SmartImage } from "./SmartImage";

type AlbumCardProps = {
  album: Album;
};

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="relative aspect-[16/10] bg-zinc-950">
        <SmartImage
          src={album.coverImage}
          alt={`Capa do álbum ${album.title}`}
          fallbackLabel={album.title}
          fallbackText="Capa em breve"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-md bg-black/80 px-2.5 py-1 text-xs font-black uppercase text-[#f0c35d]">
          {photoCategoryLabels[album.category]}
        </span>
      </div>
      <div className="p-5">
        {album.date ? (
          <p className="text-xs font-black uppercase text-[#9a6a12]">
            {formatDate(album.date)}
          </p>
        ) : null}
        <Link
          href={`/galeria/${album.slug}`}
          className="mt-2 block text-xl font-black text-zinc-950 hover:text-[#9a6a12]"
        >
          {album.title}
        </Link>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {album.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase text-zinc-500">
          <span>{album.photoIds.length} foto{album.photoIds.length === 1 ? "" : "s"}</span>
          {album.competitionSlug ? <span>{album.competitionSlug}</span> : null}
          {album.seasonSlug ? <span>{album.seasonSlug}</span> : null}
        </div>
      </div>
    </article>
  );
}

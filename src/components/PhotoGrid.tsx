import Image from "next/image";
import Link from "next/link";
import { getPlayersForPhoto } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Photo } from "@/types";

type PhotoGridProps = {
  photos: Photo[];
};

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => {
        const taggedPlayers = getPlayersForPhoto(photo.id);

        return (
          <article
            key={photo.id}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] bg-zinc-950">
              <Image
                src={photo.image}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase text-[#9a6a12]">
                {formatDate(photo.date)}
              </p>
              <h3 className="mt-2 text-lg font-black text-zinc-950">
                {photo.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {photo.caption}
              </p>
              {taggedPlayers.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {taggedPlayers.map((player) => (
                    <Link
                      key={`${photo.id}-${player.slug}`}
                      href={`/jogadores/${player.slug}`}
                      className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-[#d1a137] hover:text-black"
                    >
                      {player.nickname}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

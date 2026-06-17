import Link from "next/link";
import { formatDate } from "@/lib/format";
import { photoCategoryLabels } from "@/lib/photos";
import type { Photo } from "@/types";
import { SmartImage } from "./SmartImage";
import { TaggedPlayersList } from "./TaggedPlayersList";

type PhotoCardProps = {
  photo: Photo;
  dark?: boolean;
  featured?: boolean;
};

export function PhotoCard({ photo, dark = false, featured = false }: PhotoCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-lg ${
        dark
          ? "border border-white/10 bg-white/[0.04]"
          : "border border-zinc-200 bg-white"
      } ${featured ? "first:sm:col-span-2 first:lg:col-span-2" : ""}`}
    >
      <Link
        href={`/fotos/${photo.slug}`}
        className={`group relative block bg-zinc-950 ${
          featured ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        <SmartImage
          src={photo.url}
          alt={photo.alt}
          fallbackLabel={photo.title}
          fallbackText="Foto da galeria em breve"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-black/80 px-2.5 py-1 text-xs font-black uppercase text-[#f0c35d]">
          {photoCategoryLabels[photo.category]}
        </span>
      </Link>
      <div className="p-4">
        {photo.date ? (
          <p className="text-xs font-black uppercase text-[#b9872a]">
            {formatDate(photo.date)}
          </p>
        ) : null}
        <Link
          href={`/fotos/${photo.slug}`}
          className={`mt-2 block text-lg font-black hover:text-[#9a6a12] ${
            dark ? "text-white" : "text-zinc-950"
          }`}
        >
          {photo.title}
        </Link>
        {photo.description ? (
          <p
            className={`mt-2 text-sm leading-6 ${
              dark ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            {photo.description}
          </p>
        ) : null}
        <div className="mt-4">
          <TaggedPlayersList photoId={photo.id} dark={dark} compact />
        </div>
      </div>
    </article>
  );
}

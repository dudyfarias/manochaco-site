import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import {
  getAlbumBySlug,
  getAlbums,
  getCompetitionById,
  getMatches,
  getPhotosForAlbum,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { photoCategoryLabels } from "@/lib/photos";

type AlbumPageProps = {
  params: Promise<{ albumSlug: string }>;
};

export async function generateStaticParams() {
  const albums = await getAlbums();

  return albums.map((album) => ({
    albumSlug: album.slug,
  }));
}

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { albumSlug } = await params;
  const album = await getAlbumBySlug(albumSlug);

  if (!album) {
    return {
      title: "Álbum não encontrado",
    };
  }

  return {
    title: album.title,
    description: album.description,
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { albumSlug } = await params;
  const album = await getAlbumBySlug(albumSlug);

  if (!album) {
    notFound();
  }

  const [albumPhotos, competition, matches] = await Promise.all([
    getPhotosForAlbum(album.id),
    album.competitionSlug ? getCompetitionById(album.competitionSlug) : null,
    getMatches(),
  ]);
  const relatedMatch = album.matchId
    ? matches.find((match) => match.id === album.matchId)
    : null;

  return (
    <div className="bg-[#f7f5ef]">
      <section className="relative overflow-hidden bg-black text-white">
        <SmartImage
          src={album.coverImage}
          alt={`Capa do álbum ${album.title}`}
          fallbackLabel={album.title}
          fallbackText="Capa do álbum em breve"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase text-[#f0c35d]">
              {photoCategoryLabels[album.category]}
            </p>
            <h1 className="mt-4 text-5xl font-black leading-none sm:text-7xl">
              {album.title}
            </h1>
            {album.description ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-200">
                {album.description}
              </p>
            ) : null}
            <div className="mt-8">
              <Link
                href="/galeria"
                className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
              >
                Voltar para galeria
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <StatCard
          label="Fotos"
          value={albumPhotos.length}
          detail="neste álbum"
        />
        <StatCard
          label="Data"
          value={album.date ? formatDate(album.date) : "-"}
          detail="referência do álbum"
        />
        <StatCard
          label="Campeonato"
          value={competition?.shortName ?? "-"}
          detail={competition?.name ?? "sem vínculo"}
        />
        <StatCard
          label="Temporada"
          value={album.seasonSlug ?? "-"}
          detail={relatedMatch?.opponent ? `vs ${relatedMatch.opponent}` : "acervo"}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Fotos do álbum"
          title="Registros e marcações"
          description="Cada foto exibe apenas jogadores com marcação confirmada manualmente ou aprovada por admin."
        />
        <div className="mt-10">
          {albumPhotos.length > 0 ? (
            <PhotoGrid photos={albumPhotos} featured />
          ) : (
            <EmptyState
              title="Álbum sem fotos"
              description="Este álbum já existe na estrutura, mas ainda não possui fotos vinculadas."
            />
          )}
        </div>
      </section>
    </div>
  );
}

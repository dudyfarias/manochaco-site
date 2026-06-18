import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import { TaggedPlayersList } from "@/components/TaggedPlayersList";
import {
  getAlbumById,
  getCompetitionById,
  getMatches,
  getPhotoBySlug,
  getPhotos,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { faceRecognitionStatusLabels, photoCategoryLabels } from "@/lib/photos";

type PhotoPageProps = {
  params: Promise<{ photoSlug: string }>;
};

export async function generateStaticParams() {
  const photos = await getPhotos();

  return photos.map((photo) => ({
    photoSlug: photo.slug,
  }));
}

export async function generateMetadata({
  params,
}: PhotoPageProps): Promise<Metadata> {
  const { photoSlug } = await params;
  const photo = await getPhotoBySlug(photoSlug);

  if (!photo) {
    return {
      title: "Foto não encontrada",
    };
  }

  return {
    title: photo.title,
    description: photo.description,
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { photoSlug } = await params;
  const photo = await getPhotoBySlug(photoSlug);

  if (!photo) {
    notFound();
  }

  const [album, matches, photos, competition] = await Promise.all([
    photo.albumId ? getAlbumById(photo.albumId) : null,
    getMatches(),
    getPhotos(),
    photo.competitionSlug ? getCompetitionById(photo.competitionSlug) : null,
  ]);
  const relatedMatch = photo.matchId
    ? matches.find((match) => match.id === photo.matchId)
    : null;
  const relatedPhotos = photos
    .filter((candidate) =>
      album
        ? candidate.albumId === album.id && candidate.id !== photo.id
        : candidate.category === photo.category && candidate.id !== photo.id,
    )
    .slice(0, 3);

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-zinc-950">
            <SmartImage
              src={photo.url}
              alt={photo.alt}
              fallbackLabel={photo.title}
              fallbackText="Foto em breve"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-[#f0c35d]">
              {photoCategoryLabels[photo.category]}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
              {photo.title}
            </h1>
            {photo.description ? (
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                {photo.description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={album ? `/galeria/${album.slug}` : "/galeria"}
                className="inline-flex min-h-11 items-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#f0c35d]"
              >
                {album ? "Voltar ao álbum" : "Voltar à galeria"}
              </Link>
              <Link
                href="/galeria"
                className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
              >
                Ver galeria
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <StatCard
          label="Data"
          value={photo.date ? formatDate(photo.date) : "-"}
          detail="registro"
        />
        <StatCard
          label="Álbum"
          value={album?.title ?? "-"}
          detail={album ? "vinculado" : "sem álbum"}
        />
        <StatCard
          label="Jogo"
          value={relatedMatch?.opponent ?? "-"}
          detail={relatedMatch ? "partida relacionada" : "sem vínculo"}
        />
        <StatCard
          label="Campeonato"
          value={competition?.shortName ?? "-"}
          detail={competition?.name ?? "sem vínculo"}
        />
        <StatCard
          label="Reconhecimento"
          value={faceRecognitionStatusLabels[photo.faceRecognitionStatus]}
          detail="status interno"
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Jogadores"
            title="Marcados nesta foto"
            description="Apenas marcações confirmadas aparecem publicamente."
          />
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <TaggedPlayersList photoId={photo.id} />
          <div className="mt-6 rounded-lg border border-zinc-200 bg-[#f7f5ef] p-4">
            <p className="text-sm font-black uppercase text-[#9a6a12]">
              Estrutura futura
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              As coordenadas de rosto já estão previstas nos dados por
              `boundingBox`; a renderização visual sobre a imagem virá quando o
              painel de revisão estiver funcional.
            </p>
          </div>
        </div>
      </section>

      {relatedPhotos.length > 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Relacionadas"
              title="Mais fotos deste contexto"
              description="Fotos do mesmo álbum ou categoria."
            />
            <div className="mt-10">
              <PhotoGrid photos={relatedPhotos} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

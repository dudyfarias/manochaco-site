import Link from "next/link";
import type { Metadata } from "next";
import { AlbumCard } from "@/components/AlbumCard";
import { EmptyState } from "@/components/EmptyState";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { getAlbums, getCompetitions, getPhotos, getSeasons } from "@/lib/data";
import {
  getSingleParam,
  makeFilterHref,
  normalizeFilter,
  type SearchParamsRecord,
} from "@/lib/filters";
import { photoCategoryLabels } from "@/lib/photos";
import type { PhotoCategory } from "@/types";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Galeria de fotos do Clube Atlético Manochaco com álbuns, filtros e marcação de jogadores.",
};

type GaleriaPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

const categoryFilters: { label: string; value: PhotoCategory | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Jogos", value: "match" },
  { label: "Jogadores", value: "team" },
  { label: "Treinos", value: "training" },
  { label: "Bastidores", value: "backstage" },
  { label: "Títulos", value: "title" },
];

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
        active
          ? "border-[#d1a137] bg-[#d1a137] text-black"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-[#d1a137]/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function GaleriaPage({ searchParams }: GaleriaPageProps) {
  const resolvedSearchParams = await searchParams;
  const [albums, competitions, photos, seasons] = await Promise.all([
    getAlbums(),
    getCompetitions(),
    getPhotos(),
    getSeasons(),
  ]);
  const category = getSingleParam(resolvedSearchParams, "category");
  const competition = getSingleParam(resolvedSearchParams, "competition");
  const season = getSingleParam(resolvedSearchParams, "season");
  const selectedCategory = normalizeFilter(category) as PhotoCategory | undefined;
  const selectedCompetition = normalizeFilter(competition);
  const selectedSeason = normalizeFilter(season);
  const filteredPhotos = photos.filter(
    (photo) =>
      (!selectedCategory || photo.category === selectedCategory) &&
      (!selectedCompetition || photo.competitionSlug === selectedCompetition) &&
      (!selectedSeason || photo.seasonSlug === selectedSeason),
  );
  const filteredAlbums = albums.filter(
    (album) =>
      (!selectedCategory || album.category === selectedCategory) &&
      (!selectedCompetition || album.competitionSlug === selectedCompetition) &&
      (!selectedSeason || album.seasonSlug === selectedSeason),
  );

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:px-8">
          <SectionTitle
            eyebrow="Galeria"
            title="Fotos, álbuns e marcações"
            description="Acervo organizado por jogador, jogo, campeonato e temporada. Sugestões de IA ficam fora do público até revisão humana."
            tone="dark"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-4xl font-black text-[#f0c35d]">
                {photos.length}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-300">
                fotos locais
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-4xl font-black text-[#f0c35d]">
                {albums.length}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-300">
                álbuns
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-4xl font-black text-[#f0c35d]">
                {filteredPhotos.length}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-300">
                no filtro
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 pb-10 text-white">
        <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="mb-2 text-xs font-black uppercase text-zinc-500">
              Categoria
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={makeFilterHref("/galeria", resolvedSearchParams, {
                    category: filter.value,
                  })}
                  active={
                    filter.value === "all"
                      ? !selectedCategory
                      : selectedCategory === filter.value
                  }
                >
                  {filter.label}
                </FilterLink>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase text-zinc-500">
              Campeonato
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterLink
                href={makeFilterHref("/galeria", resolvedSearchParams, {
                  competition: "all",
                })}
                active={!selectedCompetition}
              >
                Todos
              </FilterLink>
              {competitions.map((item) => (
                <FilterLink
                  key={item.id}
                  href={makeFilterHref("/galeria", resolvedSearchParams, {
                    competition: item.id,
                  })}
                  active={selectedCompetition === item.id}
                >
                  {item.shortName}
                </FilterLink>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase text-zinc-500">
              Temporada
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterLink
                href={makeFilterHref("/galeria", resolvedSearchParams, {
                  season: "all",
                })}
                active={!selectedSeason}
              >
                Todas
              </FilterLink>
              {seasons.map((item) => (
                <FilterLink
                  key={item.id}
                  href={makeFilterHref("/galeria", resolvedSearchParams, {
                    season: item.slug,
                  })}
                  active={selectedSeason === item.slug}
                >
                  {item.label}
                </FilterLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Álbuns"
          title="Coleções do Manochaco"
          description="Álbuns por jogadores, jogos, bastidores, títulos, campeonato e temporada."
        />
        <div className="mt-10">
          {filteredAlbums.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum álbum encontrado"
              description="Não há álbuns para os filtros selecionados."
            />
          )}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Fotos"
            title={
              selectedCategory
                ? `Registros de ${photoCategoryLabels[selectedCategory]}`
                : "Registros recentes"
            }
            description="Cada foto pode ter jogadores marcados, vínculo com jogo, campeonato e temporada."
          />
          <div className="mt-10">
            {filteredPhotos.length > 0 ? (
              <PhotoGrid photos={filteredPhotos} featured />
            ) : (
              <EmptyState
                title="Nenhuma foto encontrada"
                description="Ajuste categoria, campeonato ou temporada para ampliar o acervo."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

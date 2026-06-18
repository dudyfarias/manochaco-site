import type { Metadata } from "next";
import {
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import { saveAlbum } from "@/lib/admin/actions";
import {
  listAdminAlbums,
  listAdminCompetitions,
  listAdminMatches,
  listAdminSeasons,
} from "@/lib/admin/data";

type AlbumsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Álbuns",
};

function AlbumRelationFields({
  matches,
  competitions,
  seasons,
  defaults = {},
}: {
  matches: Awaited<ReturnType<typeof listAdminMatches>>;
  competitions: Awaited<ReturnType<typeof listAdminCompetitions>>;
  seasons: Awaited<ReturnType<typeof listAdminSeasons>>;
  defaults?: {
    match_id?: string | null;
    competition_id?: string | null;
    season_id?: string | null;
    category?: string | null;
  };
}) {
  return (
    <>
      <SelectField label="Categoria" name="category" defaultValue={defaults.category ?? "general"}>
        <option value="general">Geral</option>
        <option value="match">Jogo</option>
        <option value="team">Elenco</option>
        <option value="training">Treino</option>
        <option value="backstage">Bastidores</option>
        <option value="title">Título</option>
      </SelectField>
      <SelectField label="Jogo" name="match_id" defaultValue={defaults.match_id}>
        <option value="">Sem vínculo</option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.date ?? "Sem data"} - {match.opponent}
          </option>
        ))}
      </SelectField>
      <SelectField label="Campeonato" name="competition_id" defaultValue={defaults.competition_id}>
        <option value="">Sem vínculo</option>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Temporada" name="season_id" defaultValue={defaults.season_id}>
        <option value="">Sem vínculo</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </SelectField>
    </>
  );
}

export default async function AdminAlbumsPage({ searchParams }: AlbumsPageProps) {
  const [params, albums, matches, competitions, seasons] = await Promise.all([
    searchParams,
    listAdminAlbums(),
    listAdminMatches(),
    listAdminCompetitions(),
    listAdminSeasons(),
  ]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Galeria"
        title="Álbuns"
        description="Crie e organize álbuns do acervo oficial."
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <h2 className="text-xl font-black">Criar álbum</h2>
        <form action={saveAlbum} className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Título" name="title" required />
          <Field label="Slug" name="slug" />
          <Field label="Capa" name="cover_image_url" />
          <Field label="Data" name="date" type="date" />
          <AlbumRelationFields
            matches={matches}
            competitions={competitions}
            seasons={seasons}
          />
          <div className="md:col-span-2 xl:col-span-4">
            <TextAreaField label="Descrição" name="description" />
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <SubmitButton>Criar álbum</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <div className="mt-6 grid gap-4">
        {albums.map((album) => (
          <AdminCard key={album.id}>
            <form action={saveAlbum} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input type="hidden" name="id" value={album.id} />
              <Field label="Título" name="title" defaultValue={album.title} required />
              <Field label="Slug" name="slug" defaultValue={album.slug} />
              <Field label="Capa" name="cover_image_url" defaultValue={album.cover_image_url} />
              <Field label="Data" name="date" type="date" defaultValue={album.date} />
              <AlbumRelationFields
                matches={matches}
                competitions={competitions}
                seasons={seasons}
                defaults={album}
              />
              <div className="md:col-span-2 xl:col-span-4">
                <TextAreaField
                  label="Descrição"
                  name="description"
                  defaultValue={album.description}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2 xl:col-span-4">
                <SubmitButton>Salvar álbum</SubmitButton>
              </div>
            </form>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

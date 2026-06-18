import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import { createPhoto } from "@/lib/admin/actions";
import {
  listAdminAlbums,
  listAdminCompetitions,
  listAdminMatches,
  listAdminPhotos,
  listAdminSeasons,
} from "@/lib/admin/data";

type PhotosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Fotos",
};

export default async function AdminPhotosPage({ searchParams }: PhotosPageProps) {
  const [params, photos, albums, matches, competitions, seasons] = await Promise.all([
    searchParams,
    listAdminPhotos(),
    listAdminAlbums(),
    listAdminMatches(),
    listAdminCompetitions(),
    listAdminSeasons(),
  ]);
  const albumId = typeof params.album === "string" ? params.album : "";
  const category = typeof params.category === "string" ? params.category : "";
  const competitionId = typeof params.competition === "string" ? params.competition : "";
  const albumById = new Map(albums.map((album) => [album.id, album]));
  const filteredPhotos = photos.filter((photo) => {
    const matchesAlbum = !albumId || photo.album_id === albumId;
    const matchesCategory = !category || photo.category === category;
    const matchesCompetition = !competitionId || photo.competition_id === competitionId;
    return matchesAlbum && matchesCategory && matchesCompetition;
  });

  return (
    <div>
      <AdminPageTitle
        eyebrow="Galeria"
        title="Fotos"
        description="Envie fotos para Supabase Storage, edite metadados e controle publicação pública."
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <h2 className="text-xl font-black">Enviar nova foto</h2>
        <form
          action={createPhoto}
          className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          <Field label="Título" name="title" required />
          <Field label="Slug" name="slug" />
          <Field label="URL manual" name="url" placeholder="opcional se fizer upload" />
          <label className="block">
            <span className="text-xs font-black uppercase text-zinc-500">
              Arquivo
            </span>
            <input
              name="file"
              type="file"
              accept="image/*"
              className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <Field label="Alt" name="alt" />
          <Field label="Data" name="date" type="date" />
          <SelectField label="Categoria" name="category" defaultValue="general">
            <option value="general">Geral</option>
            <option value="match">Jogo</option>
            <option value="team">Elenco</option>
            <option value="training">Treino</option>
            <option value="backstage">Bastidores</option>
            <option value="title">Título</option>
          </SelectField>
          <SelectField label="Álbum" name="album_id">
            <option value="">Sem álbum</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </SelectField>
          <SelectField label="Jogo" name="match_id">
            <option value="">Sem jogo</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.date ?? "Sem data"} - {match.opponent}
              </option>
            ))}
          </SelectField>
          <SelectField label="Campeonato" name="competition_id">
            <option value="">Sem campeonato</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Temporada" name="season_id">
            <option value="">Sem temporada</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </SelectField>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input name="is_public" type="checkbox" defaultChecked />
            Exibir no site público
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <TextAreaField label="Descrição" name="description" rows={2} />
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <SubmitButton>Salvar foto</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <AdminCard className="mt-6">
        <form className="grid gap-4 md:grid-cols-[1fr_180px_220px_auto]" action="/admin/galeria/fotos">
          <SelectField label="Álbum" name="album" defaultValue={albumId}>
            <option value="">Todos</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </SelectField>
          <SelectField label="Categoria" name="category" defaultValue={category}>
            <option value="">Todas</option>
            <option value="match">Jogo</option>
            <option value="team">Elenco</option>
            <option value="training">Treino</option>
            <option value="backstage">Bastidores</option>
            <option value="title">Título</option>
            <option value="general">Geral</option>
          </SelectField>
          <SelectField label="Campeonato" name="competition" defaultValue={competitionId}>
            <option value="">Todos</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectField>
          <button className="self-end rounded-md border border-zinc-300 px-4 py-3 text-sm font-black">
            Filtrar
          </button>
        </form>
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {filteredPhotos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-zinc-950 text-white">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Álbum</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Pública</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPhotos.map((photo) => (
                  <tr key={photo.id}>
                    <td className="px-4 py-3 font-black">{photo.title}</td>
                    <td className="px-4 py-3">{photo.category}</td>
                    <td className="px-4 py-3">
                      {photo.album_id ? albumById.get(photo.album_id)?.title ?? "-" : "-"}
                    </td>
                    <td className="px-4 py-3">{photo.date ?? "-"}</td>
                    <td className="px-4 py-3">{photo.is_public === false ? "Não" : "Sim"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/galeria/fotos/${photo.id}`}
                        className="font-black text-[#8a5b0b] hover:text-black"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            title="Nenhuma foto encontrada"
            description="Ajuste os filtros ou envie uma nova foto para o acervo."
          />
        )}
      </div>
    </div>
  );
}

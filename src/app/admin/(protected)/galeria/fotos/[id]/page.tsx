import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AdminButtonLink,
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import { SmartImage } from "@/components/SmartImage";
import {
  addPhotoPlayerTag,
  removePhotoPlayerTag,
  updatePhoto,
} from "@/lib/admin/actions";
import {
  getAdminPhoto,
  listAdminAlbums,
  listAdminCompetitions,
  listAdminMatches,
  listAdminPlayers,
  listAdminSeasons,
  listPhotoTags,
} from "@/lib/admin/data";

type PhotoDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Foto",
};

export default async function PhotoDetailPage({
  params,
  searchParams,
}: PhotoDetailPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [photo, albums, matches, competitions, seasons, players, tags] =
    await Promise.all([
      getAdminPhoto(id),
      listAdminAlbums(),
      listAdminMatches(),
      listAdminCompetitions(),
      listAdminSeasons(),
      listAdminPlayers(),
      listPhotoTags(id),
    ]);

  if (!photo) {
    notFound();
  }

  return (
    <div>
      <AdminPageTitle
        eyebrow="Fotos"
        title={photo.title}
        description="Edite metadados, publicação pública e jogadores marcados."
        action={<AdminButtonLink href="/admin/galeria/fotos" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={resolvedSearchParams} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <AdminCard>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-950">
            <SmartImage
              src={photo.url}
              alt={photo.alt ?? photo.title}
              fallbackLabel={photo.title}
              fill
              sizes="(max-width: 1280px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <p className="mt-3 break-all text-xs text-zinc-500">{photo.url}</p>
        </AdminCard>

        <AdminCard>
          <form action={updatePhoto} className="grid gap-5 md:grid-cols-2">
            <input type="hidden" name="id" value={photo.id} />
            <Field label="Título" name="title" defaultValue={photo.title} required />
            <Field label="Slug" name="slug" defaultValue={photo.slug} />
            <Field label="URL" name="url" defaultValue={photo.url} required />
            <label className="block">
              <span className="text-xs font-black uppercase text-zinc-500">
                Substituir arquivo
              </span>
              <input
                name="file"
                type="file"
                accept="image/*"
                className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <Field label="Alt" name="alt" defaultValue={photo.alt} />
            <Field label="Data" name="date" type="date" defaultValue={photo.date} />
            <SelectField label="Categoria" name="category" defaultValue={photo.category}>
              <option value="general">Geral</option>
              <option value="match">Jogo</option>
              <option value="team">Elenco</option>
              <option value="training">Treino</option>
              <option value="backstage">Bastidores</option>
              <option value="title">Título</option>
            </SelectField>
            <SelectField label="Álbum" name="album_id" defaultValue={photo.album_id}>
              <option value="">Sem álbum</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </SelectField>
            <SelectField label="Jogo" name="match_id" defaultValue={photo.match_id}>
              <option value="">Sem jogo</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.date ?? "Sem data"} - {match.opponent}
                </option>
              ))}
            </SelectField>
            <SelectField label="Campeonato" name="competition_id" defaultValue={photo.competition_id}>
              <option value="">Sem campeonato</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Temporada" name="season_id" defaultValue={photo.season_id}>
              <option value="">Sem temporada</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </SelectField>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="is_public" type="checkbox" defaultChecked={photo.is_public !== false} />
              Exibir no site público
            </label>
            <div className="md:col-span-2">
              <TextAreaField label="Descrição" name="description" defaultValue={photo.description} />
            </div>
            <div className="md:col-span-2">
              <SubmitButton>Salvar foto</SubmitButton>
            </div>
          </form>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <AdminCard>
          <h2 className="text-xl font-black">Adicionar jogador marcado</h2>
          <form action={addPhotoPlayerTag} className="mt-5 grid gap-4">
            <input type="hidden" name="photo_id" value={photo.id} />
            <SelectField label="Jogador" name="player_id">
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname} - {player.name}
                </option>
              ))}
            </SelectField>
            <SubmitButton>Adicionar marcação manual</SubmitButton>
          </form>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Tags manuais entram como confirmadas e já podem aparecer no site público.
          </p>
        </AdminCard>

        <AdminCard>
          <h2 className="text-xl font-black">Jogadores marcados</h2>
          <div className="mt-5 divide-y divide-zinc-100">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-black text-zinc-950">
                    {tag.players?.nickname ?? tag.players?.name ?? tag.player_id}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {tag.tag_type} · {tag.confirmed_by_admin ? "confirmada" : "pendente"}
                  </p>
                </div>
                <form action={removePhotoPlayerTag}>
                  <input type="hidden" name="id" value={tag.id} />
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button className="font-black text-red-700">Remover</button>
                </form>
              </div>
            ))}
            {tags.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">
                Nenhum jogador marcado nesta foto.
              </p>
            ) : null}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

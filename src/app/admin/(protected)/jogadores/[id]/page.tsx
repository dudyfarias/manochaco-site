import type { Metadata } from "next";
import Link from "next/link";
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
import { FaceRecognitionActionButton } from "@/components/admin/FaceRecognitionActionButton";
import { SmartImage } from "@/components/SmartImage";
import {
  addPlayerFaceReference,
  deactivatePlayer,
  removePlayerFaceReference,
  updatePlayerFaceReferenceConsent,
  updatePlayer,
} from "@/lib/admin/actions";
import {
  getAdminPlayer,
  listConfirmedPhotoTags,
  listPlayerCompetitionStats,
  listPlayerFaceReferences,
} from "@/lib/admin/data";
import { getPhotosForPlayer } from "@/lib/data";
import { getFaceRecognitionProviderName } from "@/lib/face-recognition/provider";

type EditPlayerPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Editar jogador",
};

export default async function EditPlayerPage({
  params,
  searchParams,
}: EditPlayerPageProps) {
  const recognitionProvider = getFaceRecognitionProviderName();
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [player, faceReferences, confirmedPhotoTags, competitionStats] = await Promise.all([
    getAdminPlayer(id),
    listPlayerFaceReferences(id),
    listConfirmedPhotoTags(id),
    listPlayerCompetitionStats(id),
  ]);

  if (!player) {
    notFound();
  }
  const publicPhotos = await getPhotosForPlayer(player.slug);
  const publicPhotoIds = new Set(publicPhotos.map((photo) => photo.id));
  const missingPublicPhotos = confirmedPhotoTags.filter(
    (tag) => tag.photos?.is_public && !publicPhotoIds.has(tag.photo_id),
  );

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogadores"
        title={`Editar ${player.nickname}`}
        description="Atualize os dados oficiais do jogador no Supabase."
        action={<AdminButtonLink href="/admin/jogadores" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={resolvedSearchParams} />

      <AdminCard className="mt-6">
        <form action={updatePlayer} className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={player.id} />
          <Field label="Nome completo" name="name" defaultValue={player.name} required />
          <Field label="Apelido" name="nickname" defaultValue={player.nickname} required />
          <Field label="Slug" name="slug" defaultValue={player.slug} />
          <SelectField label="Posição" name="position" defaultValue={player.position}>
            <option value="">A definir</option>
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Ala">Ala</option>
            <option value="Meio Campo">Meio Campo</option>
            <option value="Atacante">Atacante</option>
          </SelectField>
          <Field label="Número" name="shirt_number" type="number" defaultValue={player.shirt_number} />
          <Field label="Pé dominante" name="dominant_foot" defaultValue={player.dominant_foot} />
          <SelectField label="Status" name="status" defaultValue={player.status}>
            <option value="active">Ativo</option>
            <option value="former">Ex-jogador</option>
            <option value="staff">Comissão</option>
          </SelectField>
          <Field label="Foto principal" name="profile_image_url" defaultValue={player.profile_image_url} />
          <div className="md:col-span-2">
            <TextAreaField label="Bio" name="bio" defaultValue={player.bio} />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <SubmitButton>Salvar jogador</SubmitButton>
          </div>
        </form>
        <form action={deactivatePlayer} className="mt-4">
          <input type="hidden" name="id" value={player.id} />
          <button className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-black text-zinc-700 transition hover:border-red-300 hover:text-red-700">
            Marcar como ex-jogador
          </button>
        </form>
      </AdminCard>

      <section className="mt-6">
        <AdminPageTitle
          eyebrow="Estatísticas"
          title="Estatísticas por campeonato"
          description="Dados granulares importados para o Supabase. A edição manual entra no próximo módulo esportivo."
        />
        <AdminCard className="mt-5 overflow-hidden p-0">
          {competitionStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase text-zinc-300">
                  <tr>
                    <th className="px-4 py-3">Campeonato</th>
                    <th className="px-4 py-3">Temporada</th>
                    <th className="px-4 py-3 text-right">Jogos</th>
                    <th className="px-4 py-3 text-right">Gols</th>
                    <th className="px-4 py-3 text-right">Assistências</th>
                    <th className="px-4 py-3 text-right">Cartões</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3">Atualização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {competitionStats.map((stat) => (
                    <tr key={stat.id}>
                      <td className="px-4 py-3 font-black text-zinc-950">
                        {stat.competitions?.name ?? stat.competition_id}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {stat.seasons?.name ?? stat.season_id}
                      </td>
                      <td className="px-4 py-3 text-right">{stat.matches}</td>
                      <td className="px-4 py-3 text-right">{stat.goals}</td>
                      <td className="px-4 py-3 text-right">{stat.assists}</td>
                      <td className="px-4 py-3 text-right">
                        {stat.yellow_cards}/{stat.red_cards}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{stat.source_sheet}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {stat.updated_at
                          ? new Intl.DateTimeFormat("pt-BR").format(
                              new Date(stat.updated_at),
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              Nenhuma estatística granular vinculada a este jogador.
            </p>
          )}
        </AdminCard>
      </section>

      <section className="mt-6">
        <AdminPageTitle
          eyebrow="Biometria"
          title="Reconhecimento facial"
          description="Referências privadas usadas somente para gerar sugestões. A publicação continua dependendo de revisão humana."
        />
        <p className="mt-3 text-xs font-black uppercase text-[#9a6a12]">
          Provedor ativo: {recognitionProvider === "mock" ? "simulação local" : recognitionProvider}
        </p>
        {recognitionProvider !== "insightface" ? (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
            O provider ativo não é InsightFace. Não gere novas referências em produção até concluir a configuração do microserviço.
          </p>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <AdminCard>
            <h2 className="text-xl font-black text-zinc-950">Adicionar referência</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              O cadastro do jogador pressupõe autorização registrada pelo clube. A referência entra aprovada e pode ser revogada posteriormente.
            </p>
            <form action={addPlayerFaceReference} className="mt-5 grid gap-4">
              <input type="hidden" name="player_id" value={player.id} />
              <input type="hidden" name="player_slug" value={player.slug} />
              <label className="block">
                <span className="text-xs font-black uppercase text-zinc-500">
                  Foto JPEG ou PNG, até 5MB
                </span>
                <input
                  name="file"
                  type="file"
                  accept="image/jpeg,image/png"
                  required
                  className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <SubmitButton>Salvar referência privada</SubmitButton>
            </form>
          </AdminCard>

          <AdminCard>
            <h2 className="text-xl font-black text-zinc-950">Referências cadastradas</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {faceReferences.map((reference) => (
                <article key={reference.id} className="overflow-hidden rounded-md border border-zinc-200">
                  <div className="relative aspect-[4/3] bg-zinc-950">
                    <SmartImage
                      src={reference.signed_url}
                      alt={`Referência facial privada de ${player.nickname}`}
                      fallbackLabel={player.nickname}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-black uppercase text-[#9a6a12]">
                      {reference.indexing_status === "indexed"
                        ? "Indexada"
                        : reference.indexing_status === "indexing"
                          ? "Indexando"
                          : reference.indexing_status === "error"
                            ? "Erro"
                            : "Não indexada"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Consentimento: {reference.consent_given ? "sim" : "não"} · Aprovação: {reference.approved_for_recognition ? "sim" : "não"}
                    </p>
                    {reference.face_embedding_id ? (
                      <p className="mt-2 break-all text-xs text-zinc-500">
                        Embedding privado: {reference.face_embedding_id}
                      </p>
                    ) : null}
                    {reference.provider_face_id ? (
                      <p className="mt-2 break-all text-xs text-zinc-500">
                        Face ID: {reference.provider_face_id}
                      </p>
                    ) : null}
                    {reference.embedding_model ? (
                      <p className="mt-2 break-all text-xs text-zinc-500">
                        Embedding: {reference.embedding_model}
                      </p>
                    ) : null}
                    {reference.indexing_error ? (
                      <p className="mt-2 text-xs font-bold text-red-700">
                        {reference.indexing_error}
                      </p>
                    ) : null}
                    <form action={updatePlayerFaceReferenceConsent} className="mt-4 border-t border-zinc-100 pt-4">
                      <input type="hidden" name="id" value={reference.id} />
                      <input type="hidden" name="player_id" value={player.id} />
                      {!reference.consent_given || !reference.approved_for_recognition ? (
                        <>
                          <input type="hidden" name="consent_given" value="on" />
                          <input type="hidden" name="approved_for_recognition" value="on" />
                        </>
                      ) : null}
                      <button className="justify-self-start text-xs font-black text-[#9a6a12]">
                        {reference.consent_given && reference.approved_for_recognition
                          ? "Revogar autorização facial"
                          : "Reativar autorização facial"}
                      </button>
                    </form>
                    <div className="mt-4 flex flex-wrap items-start gap-2">
                      <FaceRecognitionActionButton
                        endpoint="/api/admin/face-recognition/index-player-face"
                        payload={{ playerFaceReferenceId: reference.id }}
                        label={reference.indexing_status === "indexed" ? "Gerar embedding novamente" : "Gerar embedding"}
                        pendingLabel="Gerando embedding..."
                        disabled={!reference.consent_given || !reference.approved_for_recognition}
                      />
                      <form action={removePlayerFaceReference}>
                        <input type="hidden" name="id" value={reference.id} />
                        <input type="hidden" name="player_id" value={player.id} />
                        <button className="min-h-11 rounded-md border border-red-200 px-3 py-2 text-xs font-black text-red-700">
                          Remover
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
              {faceReferences.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-500 sm:col-span-2">
                  Nenhuma referência facial cadastrada para este jogador.
                </p>
              ) : null}
            </div>
          </AdminCard>
        </div>
      </section>

      <section className="mt-6">
        <AdminPageTitle
          eyebrow="Publicação"
          title="Fotos públicas vinculadas"
          description={`${confirmedPhotoTags.length} marcação(ões) confirmada(s) para este jogador.`}
          action={
            <AdminButtonLink href={`/jogadores/${player.slug}`} tone="secondary">
              Abrir perfil público
            </AdminButtonLink>
          }
        />

        {missingPublicPhotos.length > 0 ? (
          <div className="mt-5 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            Existem marcações confirmadas no banco que ainda não retornaram na consulta pública do perfil.
          </div>
        ) : null}

        <AdminCard className="mt-5">
          {confirmedPhotoTags.length > 0 ? (
            <div className="divide-y divide-zinc-200">
              {confirmedPhotoTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-zinc-950">
                      {tag.photos?.title ?? tag.photo_id}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {tag.tag_type === "manual" ? "Manual" : "IA confirmada"} · {tag.photos?.is_public ? "foto pública" : "foto privada"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-black">
                    {tag.photos?.id ? (
                      <Link href={`/admin/galeria/fotos/${tag.photos.id}`} className="text-[#9a6a12]">
                        Abrir no admin
                      </Link>
                    ) : null}
                    {tag.photos?.slug ? (
                      <Link href={`/fotos/${tag.photos.slug}`} className="text-[#9a6a12]">
                        Abrir foto pública
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-zinc-500">
              Nenhuma foto possui marcação confirmada para este jogador.
            </p>
          )}
        </AdminCard>
      </section>
    </div>
  );
}

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
import { FaceRecognitionActionButton } from "@/components/admin/FaceRecognitionActionButton";
import { SmartImage } from "@/components/SmartImage";
import {
  addPlayerFaceReference,
  deactivatePlayer,
  removePlayerFaceReference,
  updatePlayerFaceReferenceConsent,
  updatePlayer,
} from "@/lib/admin/actions";
import { getAdminPlayer, listPlayerFaceReferences } from "@/lib/admin/data";
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
  const [player, faceReferences] = await Promise.all([
    getAdminPlayer(id),
    listPlayerFaceReferences(id),
  ]);

  if (!player) {
    notFound();
  }

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
          eyebrow="Biometria"
          title="Reconhecimento facial"
          description="Referências privadas usadas somente para gerar sugestões. A publicação continua dependendo de revisão humana."
        />
        <p className="mt-3 text-xs font-black uppercase text-[#9a6a12]">
          Provedor ativo: {recognitionProvider === "mock" ? "simulação local" : recognitionProvider}
        </p>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <AdminCard>
            <h2 className="text-xl font-black text-zinc-950">Adicionar referência</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Esta foto será usada como referência para reconhecimento facial do jogador. Use somente com autorização.
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
              <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                <input name="consent_given" type="checkbox" className="mt-1" />
                Consentimento específico para reconhecimento facial foi obtido.
              </label>
              <label className="flex items-start gap-3 text-sm font-bold text-zinc-800">
                <input
                  name="approved_for_recognition"
                  type="checkbox"
                  className="mt-1"
                />
                Referência revisada e aprovada para indexação.
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
                    <form action={updatePlayerFaceReferenceConsent} className="mt-4 grid gap-2 border-t border-zinc-100 pt-4">
                      <input type="hidden" name="id" value={reference.id} />
                      <input type="hidden" name="player_id" value={player.id} />
                      <label className="flex items-start gap-2 text-xs font-bold text-zinc-700">
                        <input name="consent_given" type="checkbox" defaultChecked={reference.consent_given} />
                        Consentimento registrado
                      </label>
                      <label className="flex items-start gap-2 text-xs font-bold text-zinc-700">
                        <input name="approved_for_recognition" type="checkbox" defaultChecked={reference.approved_for_recognition} />
                        Aprovada para reconhecimento
                      </label>
                      <button className="justify-self-start text-xs font-black text-[#9a6a12]">
                        Salvar permissões
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
    </div>
  );
}

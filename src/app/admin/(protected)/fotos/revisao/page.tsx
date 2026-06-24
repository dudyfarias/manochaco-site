import type { Metadata } from "next";
import {
  AdminButtonLink,
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  AdminStatCard,
  SelectField,
} from "@/components/admin/AdminUI";
import { FaceBoundingBoxOverlay } from "@/components/admin/FaceBoundingBoxOverlay";
import { ProcessPendingPhotosButton } from "@/components/admin/ProcessPendingPhotosButton";
import {
  changeFaceSuggestion,
  confirmFaceSuggestion,
  ignoreFaceSuggestion,
} from "@/lib/admin/actions";
import {
  listAdminPlayers,
  listPendingFaceSuggestions,
  listPendingRecognitionPhotos,
  getPhotoRecognitionSummary,
} from "@/lib/admin/data";
import {
  getFaceRecognitionBatchLimit,
  getFaceRecognitionProviderName,
} from "@/lib/face-recognition/provider";

type ReviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Revisão IA",
};

export default async function AdminReviewPage({ searchParams }: ReviewPageProps) {
  const provider = getFaceRecognitionProviderName();
  const batchLimit = getFaceRecognitionBatchLimit();
  const [params, suggestions, players, pendingPhotos, summary] = await Promise.all([
    searchParams,
    listPendingFaceSuggestions(),
    listAdminPlayers(),
    listPendingRecognitionPhotos(),
    getPhotoRecognitionSummary(),
  ]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Revisão IA"
        title="Sugestões pendentes"
        description="Sugestões de reconhecimento facial só viram públicas depois da aprovação humana."
        action={
          <AdminButtonLink href="/admin/diagnostico/fotos" tone="secondary">
            Diagnóstico de fotos
          </AdminButtonLink>
        }
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-950">Fila de processamento</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              As fotos são processadas uma por vez para manter a operação previsível na Vercel.
            </p>
          </div>
          <ProcessPendingPhotosButton
            photoIds={pendingPhotos.map((photo) => photo.id)}
            provider={provider}
            batchLimit={batchLimit}
          />
        </div>
      </AdminCard>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AdminStatCard label="Total" value={summary.total} />
        <AdminStatCard label="Na fila" value={summary.pending} />
        <AdminStatCard label="Processando" value={summary.processing} />
        <AdminStatCard label="Revisão" value={summary.needsReview} />
        <AdminStatCard label="Aprovadas" value={summary.approved} />
        <AdminStatCard label="Com erro" value={summary.errors} />
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion) => (
            <AdminCard key={suggestion.id} className="overflow-hidden p-0">
              <FaceBoundingBoxOverlay
                  src={suggestion.photos?.url}
                  alt={suggestion.photos?.alt ?? suggestion.photos?.title ?? "Foto em revisão"}
                  boundingBox={suggestion.bounding_box}
                  confidence={suggestion.confidence}
                />
              <div className="p-5">
                <p className="text-xs font-black uppercase text-[#9a6a12]">
                  {Math.round(suggestion.confidence * 100)}% de confiança
                </p>
                <h2 className="mt-2 text-xl font-black text-zinc-950">
                  {suggestion.photos?.title ?? "Foto sem título"}
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Sugestão:{" "}
                  <strong>
                    {suggestion.players?.nickname ?? suggestion.players?.name ?? "Sem jogador"}
                  </strong>
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Provedor: {suggestion.provider ?? "não informado"}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Face x {suggestion.bounding_box.x}, y {suggestion.bounding_box.y}, w{" "}
                  {suggestion.bounding_box.width}, h {suggestion.bounding_box.height}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {suggestion.suggested_player_id ? (
                    <form action={confirmFaceSuggestion}>
                      <input type="hidden" name="id" value={suggestion.id} />
                      <button className="rounded-md border border-[#d1a137] bg-[#d1a137] px-3 py-2 text-xs font-black text-black">
                        Confirmar
                      </button>
                    </form>
                  ) : null}
                  <form action={ignoreFaceSuggestion}>
                    <input type="hidden" name="id" value={suggestion.id} />
                    <button className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700">
                      Ignorar
                    </button>
                  </form>
                  {suggestion.photos?.id ? (
                    <AdminButtonLink
                      href={`/admin/galeria/fotos/${suggestion.photos.id}`}
                      tone="secondary"
                    >
                      Abrir foto
                    </AdminButtonLink>
                  ) : null}
                </div>
                <form action={changeFaceSuggestion} className="mt-4 grid gap-2">
                  <input type="hidden" name="id" value={suggestion.id} />
                  <SelectField label="Trocar por" name="player_id">
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.nickname} - {player.name}
                      </option>
                    ))}
                  </SelectField>
                  <button className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700">
                    Salvar troca
                  </button>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <AdminEmptyState
            title="Nenhuma sugestão pendente"
            description="Não há rostos aguardando revisão humana neste momento."
          />
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminButtonLink,
  AdminCard,
  AdminPageTitle,
  AdminStatCard,
} from "@/components/admin/AdminUI";
import { SmartImage } from "@/components/SmartImage";
import { FaceRecognitionActionButton } from "@/components/admin/FaceRecognitionActionButton";
import { ProcessPendingPhotosButton } from "@/components/admin/ProcessPendingPhotosButton";
import {
  countPlayerFaceEmbeddings,
  getPhotoRecognitionSummary,
  listConfirmedPhotoTags,
  listPendingFaceSuggestions,
  listPendingRecognitionPhotos,
} from "@/lib/admin/data";
import { getFaceRecognitionProvider } from "@/lib/face-recognition";
import {
  getFaceRecognitionBatchLimit,
  getFaceRecognitionProviderName,
} from "@/lib/face-recognition/provider";

export const metadata: Metadata = {
  title: "Admin - Reconhecimento facial",
};

export default async function FaceRecognitionAdminPage() {
  const providerName = getFaceRecognitionProviderName();
  const batchLimit = getFaceRecognitionBatchLimit();
  const [summary, confirmedTags, embeddingCount, pendingPhotos, pendingSuggestions] = await Promise.all([
    getPhotoRecognitionSummary(),
    listConfirmedPhotoTags(),
    countPlayerFaceEmbeddings(),
    listPendingRecognitionPhotos(),
    listPendingFaceSuggestions(),
  ]);
  let health: { ok: boolean; model?: string; modelLoaded?: boolean; error?: string } = {
    ok: false,
  };
  if (providerName === "insightface") {
    try {
      const provider = await getFaceRecognitionProvider();
      health = provider.health
        ? await provider.health()
        : { ok: false, error: "Provider sem health check." };
    } catch (error) {
      health = {
        ok: false,
        error: error instanceof Error ? error.message : "Serviço indisponível.",
      };
    }
  }
  const configuredUrl = process.env.FACE_RECOGNITION_API_URL?.trim() || "Não configurada";

  return (
    <div>
      <AdminPageTitle
        eyebrow="Reconhecimento facial"
        title="Operação e publicação"
        description="Acompanhe a fila, revise sugestões e confirme quais marcações já podem aparecer no site público."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminButtonLink href="/admin/fotos/revisao">Revisar sugestões</AdminButtonLink>
            <AdminButtonLink href="/admin/diagnostico/fotos" tone="secondary">
              Diagnóstico de fotos
            </AdminButtonLink>
          </div>
        }
      />

      {providerName !== "insightface" ? (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
          Provider ativo: {providerName}. Configure InsightFace antes de usar reconhecimento em produção.
        </div>
      ) : null}

      <AdminCard className="mt-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase text-[#9a6a12]">Serviço de ML</p>
            <h2 className="mt-2 text-xl font-black text-zinc-950">
              {health.ok ? "InsightFace disponível" : "InsightFace indisponível"}
            </h2>
            <p className="mt-2 break-all text-sm text-zinc-600">URL: {configuredUrl}</p>
            <p className="mt-1 text-sm text-zinc-600">
              Modelo: {health.model ?? "não informado"} · carregado: {health.modelLoaded ? "sim" : "não"}
            </p>
            {health.error ? <p className="mt-2 text-sm font-bold text-red-700">{health.error}</p> : null}
          </div>
          <FaceRecognitionActionButton
            endpoint="/api/admin/face-recognition/health"
            payload={{}}
            label="Testar conexão"
            pendingLabel="Testando serviço..."
          />
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <AdminStatCard label="Fotos" value={summary.total} detail="cadastradas no banco" />
        <AdminStatCard label="Na fila" value={summary.pending} detail="elegíveis" />
        <AdminStatCard label="Revisão" value={summary.needsReview} detail="aguardando decisão" />
        <AdminStatCard label="Aprovadas" value={summary.approved} detail="processamento concluído" />
        <AdminStatCard label="Tags públicas" value={summary.confirmedTags} detail="marcações confirmadas" />
        <AdminStatCard label="Embeddings" value={embeddingCount} detail="referências privadas" />
        <AdminStatCard label="Sugestões" value={pendingSuggestions.length} detail="pendentes" />
      </div>

      <AdminCard className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-950">Processamento em lote</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Cada execução processa no máximo {batchLimit} fotos para reduzir risco de timeout.
            </p>
          </div>
          <ProcessPendingPhotosButton
            photoIds={pendingPhotos.map((photo) => photo.id)}
            provider={providerName}
            batchLimit={batchLimit}
          />
        </div>
      </AdminCard>

      <AdminCard className="mt-6 overflow-hidden p-0">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-xl font-black text-zinc-950">Marcações confirmadas</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Estes vínculos já foram revisados e alimentam os perfis e as fotos públicas.
          </p>
        </div>
        {confirmedTags.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Foto</th>
                  <th className="px-4 py-3">Jogador</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3">Confiança</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {confirmedTags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                          <SmartImage
                            src={tag.photos?.url}
                            alt={tag.photos?.title ?? "Foto confirmada"}
                            fallbackLabel="Foto"
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-zinc-950">
                          {tag.photos?.title ?? tag.photo_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-800">
                      {tag.players?.nickname ?? tag.players?.name ?? tag.player_id}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {tag.tag_type === "manual" ? "Manual" : "IA confirmada"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {tag.confidence === null
                        ? "-"
                        : `${Math.round(tag.confidence * 100)}%`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3 font-bold">
                        {tag.photos?.id ? (
                          <Link className="text-[#9a6a12]" href={`/admin/galeria/fotos/${tag.photos.id}`}>
                            Admin
                          </Link>
                        ) : null}
                        {tag.photos?.slug ? (
                          <Link className="text-[#9a6a12]" href={`/fotos/${tag.photos.slug}`}>
                            Foto pública
                          </Link>
                        ) : null}
                        {tag.players?.slug ? (
                          <Link className="text-[#9a6a12]" href={`/jogadores/${tag.players.slug}`}>
                            Perfil
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <h3 className="text-lg font-black text-zinc-950">
              Nenhuma marcação confirmada
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Confirme uma sugestão ou adicione uma marcação manual para publicar o vínculo.
            </p>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

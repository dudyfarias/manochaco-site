import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminButtonLink,
  AdminCard,
  AdminPageTitle,
  AdminStatCard,
} from "@/components/admin/AdminUI";
import { SmartImage } from "@/components/SmartImage";
import {
  getPhotoRecognitionSummary,
  listConfirmedPhotoTags,
} from "@/lib/admin/data";

export const metadata: Metadata = {
  title: "Admin - Reconhecimento facial",
};

export default async function FaceRecognitionAdminPage() {
  const [summary, confirmedTags] = await Promise.all([
    getPhotoRecognitionSummary(),
    listConfirmedPhotoTags(),
  ]);

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Fotos" value={summary.total} detail="cadastradas no banco" />
        <AdminStatCard label="Na fila" value={summary.pending} detail="elegíveis" />
        <AdminStatCard label="Revisão" value={summary.needsReview} detail="aguardando decisão" />
        <AdminStatCard label="Aprovadas" value={summary.approved} detail="processamento concluído" />
        <AdminStatCard label="Tags públicas" value={summary.confirmedTags} detail="marcações confirmadas" />
      </div>

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

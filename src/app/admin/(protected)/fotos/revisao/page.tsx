import type { Metadata } from "next";
import {
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  SelectField,
} from "@/components/admin/AdminUI";
import { SmartImage } from "@/components/SmartImage";
import {
  changeFaceSuggestion,
  confirmFaceSuggestion,
  ignoreFaceSuggestion,
} from "@/lib/admin/actions";
import { listAdminPlayers, listPendingFaceSuggestions } from "@/lib/admin/data";

type ReviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Revisão IA",
};

export default async function AdminReviewPage({ searchParams }: ReviewPageProps) {
  const [params, suggestions, players] = await Promise.all([
    searchParams,
    listPendingFaceSuggestions(),
    listAdminPlayers(),
  ]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Revisão IA"
        title="Sugestões pendentes"
        description="Sugestões de reconhecimento facial só viram públicas depois da aprovação humana."
      />
      <AdminNotice searchParams={params} />

      {suggestions.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion) => (
            <AdminCard key={suggestion.id} className="overflow-hidden p-0">
              <div className="relative aspect-[4/3] bg-zinc-950">
                <SmartImage
                  src={suggestion.photos?.url}
                  alt={suggestion.photos?.alt ?? suggestion.photos?.title ?? "Foto em revisão"}
                  fallbackLabel={suggestion.photos?.title ?? "Foto"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
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
                  Face x {suggestion.bounding_box.x}, y {suggestion.bounding_box.y}, w{" "}
                  {suggestion.bounding_box.width}, h {suggestion.bounding_box.height}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={confirmFaceSuggestion}>
                    <input type="hidden" name="id" value={suggestion.id} />
                    <button className="rounded-md border border-[#d1a137] bg-[#d1a137] px-3 py-2 text-xs font-black text-black">
                      Confirmar
                    </button>
                  </form>
                  <form action={ignoreFaceSuggestion}>
                    <input type="hidden" name="id" value={suggestion.id} />
                    <button className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700">
                      Ignorar
                    </button>
                  </form>
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
            description="Quando o reconhecimento facial real for implementado, sugestões pendentes aparecerão aqui."
          />
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { faceSuggestions, photos } from "@/data";
import { getLocalPlayerBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "Revisão de IA mockada",
  description:
    "Fila mockada de sugestões de reconhecimento facial para revisão humana.",
};

export default function AdminFotosRevisaoPage() {
  const pendingSuggestions = faceSuggestions.filter(
    (suggestion) => suggestion.status === "pending",
  );

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Revisão humana"
            title="Sugestões de reconhecimento facial"
            description="Dados mockados. Nenhuma sugestão pendente aparece no site público antes de aprovação."
            tone="dark"
          />
          <div className="mt-8">
            <Link
              href="/admin/fotos"
              className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
            >
              Voltar ao fluxo de fotos
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {pendingSuggestions.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pendingSuggestions.map((suggestion) => {
              const photo = photos.find((item) => item.id === suggestion.photoId);
              const player = suggestion.suggestedPlayerSlug
                ? getLocalPlayerBySlug(suggestion.suggestedPlayerSlug)
                : null;

              return (
                <article
                  key={suggestion.id}
                  className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-zinc-950">
                    {photo ? (
                      <SmartImage
                        src={photo.url}
                        alt={photo.alt}
                        fallbackLabel={photo.title}
                        fallbackText="Foto em revisão"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase text-[#9a6a12]">
                      {Math.round(suggestion.confidence * 100)}% de confiança
                    </p>
                    <h2 className="mt-2 text-xl font-black text-zinc-950">
                      {photo?.title ?? "Foto não encontrada"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      Sugestão: {player?.nickname ?? "Jogador não identificado"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Face: x {suggestion.boundingBox.x}, y{" "}
                      {suggestion.boundingBox.y}, w {suggestion.boundingBox.width},
                      h {suggestion.boundingBox.height}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button className="rounded-md border border-[#d1a137] bg-[#d1a137] px-3 py-2 text-xs font-black text-black">
                        Confirmar
                      </button>
                      <button className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700">
                        Trocar jogador
                      </button>
                      <button className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700">
                        Ignorar
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      Botões apenas visuais nesta fase.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma sugestão pendente"
            description="Quando houver processamento mockado com status pending, ele aparecerá nesta fila."
          />
        )}
      </section>
    </div>
  );
}

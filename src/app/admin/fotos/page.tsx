import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { albums, faceSuggestions, photos, photoPlayers } from "@/data";

export const metadata: Metadata = {
  title: "Admin de fotos mockado",
  description:
    "Tela mockada para futuro fluxo administrativo de fotos do CA Manochaco.",
};

const workflowItems = [
  "Upload de fotos para Storage",
  "Criação ou seleção de álbum",
  "Vínculo com jogo, campeonato e temporada",
  "Marcação manual de jogadores",
  "Revisão de sugestões de IA",
  "Publicação apenas de marcações confirmadas",
];

export default function AdminFotosPage() {
  const pendingSuggestions = faceSuggestions.filter(
    (suggestion) => suggestion.status === "pending",
  );
  const confirmedTags = photoPlayers.filter((tag) => tag.confirmedByAdmin);

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Mock administrativo"
            title="Fluxo futuro de fotos"
            description="Tela visual sem autenticação, upload ou persistência real. Serve para preparar o painel administrativo futuro."
            tone="dark"
          />
          <div className="mt-8">
            <Link
              href="/admin/fotos/revisao"
              className="inline-flex min-h-11 items-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#f0c35d]"
            >
              Ver fila de revisão
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <StatCard label="Fotos" value={photos.length} detail="mockadas" />
        <StatCard label="Álbuns" value={albums.length} detail="organizados" />
        <StatCard
          label="Tags"
          value={confirmedTags.length}
          detail="confirmadas ou pendentes"
        />
        <StatCard
          label="IA"
          value={pendingSuggestions.length}
          detail="sugestões pendentes"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflowItems.map((item, index) => (
            <article
              key={item}
              className="rounded-lg border border-zinc-200 bg-white p-6"
            >
              <p className="text-sm font-black uppercase text-[#9a6a12]">
                Etapa {index + 1}
              </p>
              <h2 className="mt-3 text-xl font-black text-zinc-950">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Estrutura preparada para Supabase Storage, banco de dados,
                auditoria e revisão humana antes de qualquer publicação.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

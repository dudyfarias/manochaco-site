import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Placeholder da futura área administrativa protegida do Clube Atlético Manochaco.",
};

const futureModules = [
  "Autenticação com Supabase Auth",
  "Cadastro de jogadores, jogos e estatísticas",
  "Upload de fotos para Supabase Storage",
  "Marcação manual de jogadores em fotos",
  "Revisão de sugestões de reconhecimento facial",
  "Auditoria de alterações administrativas",
];

export default function AdminPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Admin"
            title="Painel administrativo futuro"
            description="Esta rota é apenas um placeholder visual. Não há autenticação, persistência ou ações administrativas reais nesta fase."
            tone="dark"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/fotos"
              className="inline-flex min-h-11 items-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#f0c35d]"
            >
              Fluxo de fotos mockado
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {futureModules.map((item, index) => (
            <article
              key={item}
              className="rounded-lg border border-zinc-200 bg-white p-6"
            >
              <p className="text-sm font-black uppercase text-[#9a6a12]">
                Módulo {index + 1}
              </p>
              <h2 className="mt-3 text-xl font-black text-zinc-950">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Será protegido por Supabase Auth e validação server-side antes
                de qualquer operação real.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

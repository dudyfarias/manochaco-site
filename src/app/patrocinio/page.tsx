import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";

export const metadata: Metadata = {
  title: "Patrocínio",
  description:
    "Oportunidades de patrocínio para marcas apoiarem o Clube Atlético Manochaco.",
};

const opportunities = [
  "Marca em área de destaque no portal oficial.",
  "Exposição em fotos, cards de jogos e publicações futuras.",
  "Associação com jogadores, estatísticas, campanhas e títulos.",
  "Base preparada para mídia kit e relatórios de visibilidade.",
];

export default function PatrocinioPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="relative overflow-hidden bg-black text-white">
        <SmartImage
          src="/team/comemoracao.jpg"
          alt="Foto real do Manochaco em contexto de jogo para patrocínio"
          fallbackLabel="Patrocínio Manochaco"
          fallbackText="Foto de patrocínio em breve"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Patrocínio"
            title="Apoie o Manochaco"
            description="Uma marca parceira aparece junto de uma comunidade real, com estética premium e organização de clube profissional."
            tone="dark"
          />
          <div className="mt-8">
            <ButtonLink href="/contato">Falar sobre parceria</ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Para marcas"
            title="Visibilidade com contexto"
            description="A primeira fase já prepara espaços editoriais e visuais para patrocinadores, sem poluir a experiência do torcedor."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map((item) => (
            <article
              key={item}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-base font-bold leading-7 text-zinc-950">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

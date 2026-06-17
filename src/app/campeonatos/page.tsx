import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { CompetitionBadge } from "@/components/CompetitionBadge";
import { SectionTitle } from "@/components/SectionTitle";
import { competitions } from "@/data";

export const metadata: Metadata = {
  title: "Campeonatos",
  description:
    "Competições disputadas pelo Clube Atlético Manochaco: Liga7 Playball, Copa FutFudas, Copa Amstel e Chuteira.",
};

const competitionDescriptions: Record<string, string> = {
  "liga7-playball":
    "O Manochaco começou sua trajetória na Série D da Liga7 da Playball e chegou à Série B.",
  "copa-futfudas":
    "Campeonato à parte realizado pela Playball Pompeia, em formato de jogo único. Quem vence a partida é campeão. O Manochaco já venceu duas vezes.",
  "copa-amstel": "Campeonato disputado atualmente pelo Manochaco.",
  chuteira: "Campeonato disputado atualmente pelo Manochaco.",
};

export default function CampeonatosPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Campeonatos"
            title="Onde o Manochaco compete"
            description="A estrutura de competições alimenta filtros de estatísticas, jogos e futuras campanhas por temporada."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {competitions.map((competition) => (
            <article
              key={competition.id}
              className="rounded-lg border border-zinc-200 bg-white p-6"
            >
              <CompetitionBadge kind={competition.slug}>
                {competition.shortName}
              </CompetitionBadge>
              <h2 className="mt-5 text-3xl font-black text-zinc-950">
                {competition.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                {competitionDescriptions[competition.id] ?? competition.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink
                  href={`/estatisticas?competition=${competition.id}`}
                  variant="dark"
                >
                  Ver estatísticas
                </ButtonLink>
                <ButtonLink
                  href={`/jogos?competition=${competition.id}`}
                  variant="secondary"
                >
                  Ver jogos
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

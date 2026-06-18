import type { Metadata } from "next";
import { CompetitionBadge } from "@/components/CompetitionBadge";
import { SectionTitle } from "@/components/SectionTitle";
import { getCompetitions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Títulos e campanhas",
  description:
    "Títulos, campanhas e competições relevantes do Clube Atlético Manochaco.",
};

const campaigns = [
  {
    title: "Copa FutFudas",
    result: "2 títulos",
    competitionId: "copa-futfudas",
    text: "Competição em jogo único na Playball Pompeia. Quem vence é campeão; o Manochaco venceu duas vezes.",
  },
  {
    title: "Liga7 da Playball",
    result: "Série D até Série B",
    competitionId: "liga7-playball",
    text: "Trajetória de crescimento competitivo desde a entrada na Série D até alcançar a Série B.",
  },
  {
    title: "Copa Amstel de sábado",
    result: "Em disputa",
    competitionId: "copa-amstel",
    text: "Calendário ativo para manter ritmo, visibilidade e competitividade dos jogadores.",
  },
  {
    title: "Chuteira",
    result: "Em disputa",
    competitionId: "chuteira",
    text: "Mais uma frente de competição para ampliar repertório contra adversários variados.",
  },
];

export default async function TitulosPage() {
  const competitions = await getCompetitions();

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Títulos"
            title="Taças e campanhas"
            description="O histórico começa enxuto, com destaque para a Copa FutFudas e a evolução na Liga7 da Playball."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        {campaigns.map((campaign) => {
          const competition = competitions.find(
            (item) => item.id === campaign.competitionId,
          );

          return (
            <article
              key={campaign.title}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                {competition ? (
                  <CompetitionBadge kind={competition.slug}>
                    {competition.shortName}
                  </CompetitionBadge>
                ) : null}
                <span className="text-sm font-semibold text-zinc-500">
                  {campaign.result}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-zinc-950">
                {campaign.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-zinc-600">
                {campaign.text}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

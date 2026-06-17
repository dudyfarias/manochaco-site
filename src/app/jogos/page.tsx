import type { Metadata } from "next";
import { MatchCard } from "@/components/MatchCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getPlayedMatches, getScheduledMatches } from "@/lib/data";

export const metadata: Metadata = {
  title: "Jogos e resultados",
  description:
    "Agenda, resultados e detalhes de partidas do Clube Atlético Manochaco.",
};

export default function JogosPage() {
  const playedMatches = getPlayedMatches();
  const scheduledMatches = getScheduledMatches();

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Jogos"
            title="Agenda e resultados"
            description="Cada partida tem slug próprio, dados de competição, placar, local, destaques e jogadores relacionados."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">Próximos jogos</h2>
            <div className="mt-5 grid gap-5">
              {scheduledMatches.map((match) => (
                <MatchCard key={match.id} match={match} compact />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-950">Resultados</h2>
            <div className="mt-5 grid gap-5">
              {playedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

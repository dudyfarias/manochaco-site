import type { Metadata } from "next";
import { RankingTable } from "@/components/RankingTable";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import {
  appearancesRanking,
  assistsRanking,
  clubStats,
  scoringRanking,
} from "@/data/stats";
import { formatRecord } from "@/lib/format";

export const metadata: Metadata = {
  title: "Estatísticas",
  description:
    "Estatísticas históricas, rankings de artilharia, assistências e presença do CA Manochaco.",
};

export default function EstatisticasPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Estatísticas"
            title="Números históricos do clube"
            description="Os dados são mockados nesta fase, mas já centralizados para futura importação de planilha ou integração com Supabase."
            tone="dark"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              dark
              label="Campanha"
              value={formatRecord(clubStats.wins, clubStats.draws, clubStats.losses)}
              detail={`${clubStats.matches} jogos registrados`}
            />
            <StatCard
              dark
              label="Gols feitos"
              value={clubStats.goalsFor}
              detail={`${clubStats.goalsAgainst} sofridos`}
            />
            <StatCard
              dark
              label="Saldo de gols"
              value={`+${clubStats.goalDifference}`}
              detail="Ataque e defesa no agregado"
            />
            <StatCard
              dark
              label="Copa FutFudas"
              value={clubStats.futFudasTitles}
              detail="Títulos oficiais do mock"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <RankingTable title="Artilharia" rows={scoringRanking} />
        <RankingTable title="Assistências" rows={assistsRanking} />
        <RankingTable title="Presença" rows={appearancesRanking} />
      </section>
    </div>
  );
}

import { ButtonLink } from "@/components/ButtonLink";
import { HeroSection } from "@/components/HeroSection";
import { MatchCard } from "@/components/MatchCard";
import { PhotoGrid } from "@/components/PhotoGrid";
import { PlayerCard } from "@/components/PlayerCard";
import { RankingTable } from "@/components/RankingTable";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import {
  appearancesRanking,
  assistsRanking,
  clubStats,
  photos,
  players,
  scoringRanking,
} from "@/data";
import { getPlayedMatches, getScheduledMatches } from "@/lib/data";

export default function Home() {
  const lastResult = getPlayedMatches()[0];
  const nextMatch = getScheduledMatches()[0];
  const featuredPlayers = players.slice(0, 4);

  return (
    <div className="bg-[#f7f5ef]">
      <HeroSection />

      <section className="bg-black pb-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          <StatCard dark label="Jogos" value={clubStats.matches} detail="registrados" />
          <StatCard dark label="Vitórias" value={clubStats.wins} detail={`${clubStats.draws} empates`} />
          <StatCard dark label="Gols" value={clubStats.goalsFor} detail="marcados" />
          <StatCard dark label="Saldo" value={`+${clubStats.goalDifference}`} detail="de gols" />
          <StatCard dark label="FutFudas" value={clubStats.futFudasTitles} detail="títulos" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div className="flex flex-col justify-between gap-8">
          <SectionTitle
            eyebrow="Agenda"
            title="Resultado recente e próximo jogo"
            description="Placares, competições e detalhes de partida organizados para virar acervo oficial do clube."
          />
          <div className="rounded-lg bg-zinc-950 p-6 text-white">
            <p className="text-xs font-black uppercase text-[#d1a137]">
              Base de dados
            </p>
            <p className="mt-3 text-2xl font-black">
              Estatísticas reais por competição
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              A planilha Manochaco será a base para alimentar jogador,
              temporada, ranking e estatística geral do time.
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {lastResult ? <MatchCard match={lastResult} compact /> : null}
          {nextMatch ? <MatchCard match={nextMatch} compact /> : null}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Jogadores"
              title="Atletas em destaque"
              description="Perfis individuais com números, fotos relacionadas e jogos ligados a cada jogador."
            />
            <ButtonLink href="/jogadores">Ver jogadores</ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Rankings"
            title="Números que contam a história"
            description="Artilharia, assistências e presença organizadas para filtros futuros por temporada e campeonato."
          />
          <ButtonLink href="/estatisticas" variant="dark">
            Ver estatísticas
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <RankingTable title="Artilharia" rows={scoringRanking} />
          <RankingTable title="Assistências" rows={assistsRanking} />
          <RankingTable title="Presença" rows={appearancesRanking} />
        </div>
      </section>

      <section className="bg-zinc-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Galeria"
              title="Fotos do Manochaco"
              description="Registros reais do time, jogos e bastidores, com a base pronta para marcação de jogadores por foto."
              tone="dark"
            />
            <ButtonLink href="/galeria" variant="ghost">
              Abrir galeria
            </ButtonLink>
          </div>
          <div className="mt-10">
            <PhotoGrid photos={photos.slice(0, 3)} tone="dark" featured />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-lg bg-black p-6 text-white sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <SectionTitle
            eyebrow="Patrocínio"
            title="Clube amador, presença profissional"
            description="Espaço para marcas aparecerem junto de jogos, fotos, jogadores, estatísticas e campanhas do Manochaco."
            tone="dark"
          />
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/patrocinio">Conhecer oportunidades</ButtonLink>
            <ButtonLink href="/contato" variant="ghost">
              Falar com o clube
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

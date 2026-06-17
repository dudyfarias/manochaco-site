import { AlbumCard } from "@/components/AlbumCard";
import { ButtonLink } from "@/components/ButtonLink";
import { HeroSection } from "@/components/HeroSection";
import { MatchCard } from "@/components/MatchCard";
import { PhotoGrid } from "@/components/PhotoGrid";
import { PlayerCard } from "@/components/PlayerCard";
import { RankingTable } from "@/components/RankingTable";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { albums } from "@/data/albums";
import { photos } from "@/data/photos";
import { players } from "@/data/players";
import { clubStats, scoringRanking } from "@/data/stats";
import { getPlayedMatches, getScheduledMatches } from "@/lib/data";
import { formatRecord } from "@/lib/format";

export default function Home() {
  const lastResult = getPlayedMatches()[0];
  const nextMatch = getScheduledMatches()[0];
  const featuredPlayers = players.slice(0, 4);

  return (
    <div className="bg-[#f7f5ef]">
      <HeroSection />

      <section className="bg-black pb-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatCard
            dark
            label="Jogos registrados"
            value={clubStats.matches}
            detail={formatRecord(clubStats.wins, clubStats.draws, clubStats.losses)}
          />
          <StatCard
            dark
            label="Gols feitos"
            value={clubStats.goalsFor}
            detail={`${clubStats.goalsAgainst} gols sofridos`}
          />
          <StatCard
            dark
            label="Saldo"
            value={`+${clubStats.goalDifference}`}
            detail="Diferença histórica de gols"
          />
          <StatCard
            dark
            label="Copa FutFudas"
            value={clubStats.futFudasTitles}
            detail="Títulos em jogo único"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Agenda"
            title="Último resultado e próximo compromisso"
            description="A primeira fase do portal já organiza placares, competições e detalhes de partida a partir de dados locais."
          />
        </div>
        <div className="grid gap-5">
          {lastResult ? <MatchCard match={lastResult} compact /> : null}
          {nextMatch ? <MatchCard match={nextMatch} compact /> : null}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Elenco"
              title="Nomes que carregam o Manochaco"
              description="Perfis individuais com números, fotos relacionadas e jogos em que cada atleta aparece."
            />
            <ButtonLink href="/elenco" variant="primary">
              Ver elenco completo
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Estatísticas"
            title="Rankings para contar a história"
            description="Artilharia, assistências e presença começam mockados, mas já usam uma estrutura pronta para virar banco de dados."
          />
          <div className="mt-6">
            <ButtonLink href="/estatisticas" variant="primary">
              Explorar estatísticas
            </ButtonLink>
          </div>
        </div>
        <RankingTable title="Artilharia histórica" rows={scoringRanking} />
      </section>

      <section className="bg-zinc-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Galeria"
              title="Fotos grandes, memória organizada"
              description="A galeria já simula marcação de jogadores em fotos e está preparada para álbuns, upload e revisão humana."
              tone="dark"
            />
            <ButtonLink href="/galeria" variant="ghost">
              Abrir galeria
            </ButtonLink>
          </div>
          <div className="mt-10">
            <PhotoGrid photos={photos.slice(0, 3)} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <SectionTitle
            eyebrow="Patrocínio"
            title="Clube amador, organização profissional"
            description="O portal cria espaço para marcas aparecerem junto de jogos, fotos, elenco, estatísticas e campanhas do Manochaco."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/patrocinio">Conhecer oportunidades</ButtonLink>
            <ButtonLink href="/contato" variant="secondary">
              Falar com o clube
            </ButtonLink>
          </div>
        </div>
        <AlbumCard album={albums[0]} />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import { getStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "História",
  description:
    "A origem do Clube Atlético Manochaco, de 2014 à trajetória nas competições da Playball.",
};

const timeline = [
  {
    year: "2014",
    title: "Nasce o Manochaco",
    text: "O clube surge de um grupo de amigos ligado ao Santa Marcelina, com identidade própria e bola rolando entre amigos.",
  },
  {
    year: "Série D",
    title: "Primeiros passos na Liga7",
    text: "O Manochaco começa sua caminhada na Série D da Liga7 da Playball, aprendendo a competir como grupo.",
  },
  {
    year: "Série B",
    title: "Crescimento competitivo",
    text: "A evolução dos jogadores leva o clube até a Série B da Liga7 da Playball, consolidando uma história de acesso e permanência.",
  },
  {
    year: "2x",
    title: "Copa FutFudas",
    text: "Em formato de jogo único na Playball Pompeia, a Copa FutFudas vira palco de duas conquistas do Manochaco.",
  },
];

export default async function HistoriaPage() {
  const clubStats = await getStats();

  return (
    <div className="bg-[#f7f5ef]">
      <section className="relative overflow-hidden bg-black text-white">
        <SmartImage
          src="/team/bastidores.jpg"
          alt="Foto real de bastidores do Clube Atlético Manochaco"
          fallbackLabel="História Manochaco"
          fallbackText="Foto histórica em breve"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-base font-semibold uppercase text-[#f0c35d]">
              História
            </p>
            <h1 className="text-5xl font-black leading-none sm:text-6xl">
              Amizade, competição e identidade.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-200">
              O Manochaco nasceu em 2014, cresceu na Playball e construiu uma
              cultura de clube amador com ambição, memória e organização.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Origem"
            title="Do Santa Marcelina para a Playball"
            description="A base do Manochaco é simples e forte: amigos, compromisso e uma camisa preta e dourada que virou símbolo de grupo."
          />
          <p className="mt-6 text-base leading-8 text-zinc-700">
            O Clube Atlético Manochaco começou como encontro de amigos ligados
            ao Santa Marcelina. A competitividade apareceu naturalmente: o time
            entrou na Série D da Liga7 da Playball, enfrentou campeonatos
            maiores e chegou à Série B, levando junto uma identidade visual
            premium, direta e reconhecível.
          </p>
          <p className="mt-4 text-base leading-8 text-zinc-700">
            Além da Liga7, o clube também disputa a Copa Amstel de sábado e o
            Chuteira. A Copa FutFudas tem um lugar especial na memória: é um
            campeonato à parte da Playball Pompeia, em jogo único, em que quem
            vence é campeão. O Manochaco já levantou essa taça duas vezes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Fundação" value="2014" detail="Primeira geração do clube" />
          <StatCard
            label="Liga7"
            value="Série B"
            detail="Trajetória desde a Série D"
          />
          <StatCard
            label="Gols feitos"
            value={clubStats.goalsFor}
            detail="Em jogos registrados"
          />
          <StatCard
            label="FutFudas"
            value={clubStats.futFudasTitles}
            detail="Títulos conquistados"
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Linha do tempo"
            title="Marcos do clube"
            description="Uma primeira estrutura editorial para receber temporadas, acessos, títulos e registros oficiais."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {timeline.map((item) => (
              <article
                key={`${item.year}-${item.title}`}
                className="rounded-lg border border-zinc-200 bg-[#f7f5ef] p-5"
              >
                <p className="text-3xl font-black text-[#9a6a12]">
                  {item.year}
                </p>
                <h2 className="mt-4 text-xl font-black text-zinc-950">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/titulos">Ver títulos e campanhas</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import type { Player } from "@/types";
import { SmartImage } from "./SmartImage";

type PlayerCardProps = {
  player: Player;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/jogadores/${player.slug}`}
      className="group overflow-hidden rounded-lg bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d1a137]"
    >
      <div className="relative aspect-[4/5] bg-zinc-900">
        <SmartImage
          src={player.image}
          alt={`Foto de ${player.nickname}`}
          fallbackLabel={player.nickname}
          fallbackText="Foto do jogador em breve"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase text-[#f0c35d]">
              {player.position} · {player.shirtNumber ?? player.number ?? "S/N"}
            </p>
            {player.status === "former" ? (
              <span className="rounded-md border border-white/20 px-2 py-1 text-[10px] font-black uppercase text-zinc-200">
                Histórico
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-2xl font-black text-white">
            {player.nickname}
          </h3>
          <p className="mt-1 text-sm text-zinc-300">{player.fullName}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-zinc-100 border border-t-0 border-zinc-200 text-center">
        <div className="p-3">
          <p className="text-lg font-black text-zinc-950">
            {player.stats.matches}
          </p>
          <p className="text-xs text-zinc-500">Jogos</p>
        </div>
        <div className="p-3">
          <p className="text-lg font-black text-zinc-950">
            {player.stats.goals}
          </p>
          <p className="text-xs text-zinc-500">Gols</p>
        </div>
        <div className="p-3">
          <p className="text-lg font-black text-zinc-950">
            {player.stats.assists}
          </p>
          <p className="text-xs text-zinc-500">Assists</p>
        </div>
      </div>
    </Link>
  );
}

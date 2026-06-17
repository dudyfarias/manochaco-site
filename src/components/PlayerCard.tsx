import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/types";

type PlayerCardProps = {
  player: Player;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/jogadores/${player.slug}`}
      className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d1a137]/70 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] bg-zinc-900">
        <Image
          src={player.image}
          alt={`Foto de ${player.nickname}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4">
          <p className="text-sm font-semibold text-[#f0c35d]">
            {player.position}
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">
            {player.nickname}
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-zinc-200 text-center">
        <div className="p-3">
          <p className="text-lg font-black text-zinc-950">{player.stats.matches}</p>
          <p className="text-xs text-zinc-500">Jogos</p>
        </div>
        <div className="p-3">
          <p className="text-lg font-black text-zinc-950">{player.stats.goals}</p>
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

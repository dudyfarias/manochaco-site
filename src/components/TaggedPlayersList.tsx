import Link from "next/link";
import { getLocalPlayersForPhoto } from "@/lib/data";

type TaggedPlayersListProps = {
  photoId: string;
  dark?: boolean;
  compact?: boolean;
};

export function TaggedPlayersList({
  photoId,
  dark = false,
  compact = false,
}: TaggedPlayersListProps) {
  const taggedPlayers = getLocalPlayersForPhoto(photoId);

  if (taggedPlayers.length === 0) {
    return (
      <p
        className={`text-sm ${dark ? "text-zinc-400" : "text-zinc-500"} ${
          compact ? "text-xs" : ""
        }`}
      >
        Nenhum jogador marcado
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {taggedPlayers.map((player) => (
        <Link
          key={`${photoId}-${player.slug}`}
          href={`/jogadores/${player.slug}`}
          className={`rounded-md px-2.5 py-1 font-bold transition ${
            compact ? "text-xs" : "text-sm"
          } ${
            dark
              ? "bg-white/10 text-zinc-200 hover:bg-[#d1a137] hover:text-black"
              : "bg-zinc-100 text-zinc-700 hover:bg-[#d1a137] hover:text-black"
          }`}
        >
          {player.nickname}
        </Link>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionTitle } from "@/components/SectionTitle";
import { players } from "@/data/players";

export const metadata: Metadata = {
  title: "Elenco",
  description:
    "Elenco do Clube Atlético Manochaco com perfis individuais, números e fotos relacionadas.",
};

const positions = ["Goleiro", "Fixo", "Ala", "Meia", "Pivô"] as const;

export default function ElencoPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Elenco"
            title="Atletas do Manochaco"
            description="Páginas individuais por slug, com estatísticas, jogos relacionados e fotos em que cada jogador aparece."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-14">
          {positions.map((position) => {
            const groupedPlayers = players.filter(
              (player) => player.position === position,
            );

            if (groupedPlayers.length === 0) {
              return null;
            }

            return (
              <div key={position}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-zinc-300" />
                  <h2 className="text-sm font-black uppercase text-[#9a6a12]">
                    {position}
                  </h2>
                  <span className="h-px flex-1 bg-zinc-300" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {groupedPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

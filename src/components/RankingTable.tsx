import Link from "next/link";
import { getPlayerBySlug } from "@/lib/data";
import type { RankingRow } from "@/types";
import { EmptyState } from "./EmptyState";

type RankingTableProps = {
  title: string;
  rows: RankingRow[];
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function RankingTable({
  title,
  rows,
  description,
  emptyTitle = "Sem dados para este ranking",
  emptyDescription = "Tente outro campeonato, temporada ou tipo de ranking.",
}: RankingTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-black text-zinc-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
          ) : null}
        </div>
        <span className="text-xs font-black uppercase text-[#9a6a12]">
          Top {rows.length}
        </span>
      </div>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-[#f7f5ef]">
              <tr>
                <th className="w-16 px-5 py-3 text-xs font-bold uppercase text-zinc-500">
                  #
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-zinc-500">
                  Jogador
                </th>
                <th className="hidden px-5 py-3 text-xs font-bold uppercase text-zinc-500 sm:table-cell">
                  Camisa
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase text-zinc-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row, index) => {
                const player = getPlayerBySlug(row.playerSlug);
                const isTopThree = index < 3;

                return (
                  <tr
                    key={`${row.playerSlug}-${row.unit}`}
                    className={isTopThree ? "bg-[#fbf7ed]" : "hover:bg-zinc-50"}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-black ${
                          isTopThree
                            ? "bg-[#d1a137] text-black"
                            : "bg-zinc-100 text-[#9a6a12]"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/jogadores/${row.playerSlug}`}
                        className="font-bold text-zinc-950 hover:text-[#9a6a12]"
                      >
                        {row.nickname}
                      </Link>
                      <p className="text-sm text-zinc-500">{row.fullName}</p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-black text-zinc-600">
                        #{player?.shirtNumber ?? player?.number ?? "S/N"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-xl font-black text-zinc-950">
                        {row.value}
                      </span>
                      <span className="ml-2 text-sm text-zinc-500">
                        {row.unit}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}
    </section>
  );
}

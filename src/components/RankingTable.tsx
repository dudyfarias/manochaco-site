import Link from "next/link";
import type { RankingRow } from "@/types";

type RankingTableProps = {
  title: string;
  rows: RankingRow[];
};

export function RankingTable({ title, rows }: RankingTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="text-lg font-black text-zinc-950">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="w-16 px-5 py-3 text-xs font-bold uppercase text-zinc-500">
                #
              </th>
              <th className="px-5 py-3 text-xs font-bold uppercase text-zinc-500">
                Jogador
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase text-zinc-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr key={`${row.playerSlug}-${row.unit}`}>
                <td className="px-5 py-4 text-sm font-black text-[#9a6a12]">
                  {index + 1}
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
                <td className="px-5 py-4 text-right">
                  <span className="text-xl font-black text-zinc-950">
                    {row.value}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500">{row.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminCard,
  AdminPageTitle,
  AdminStatCard,
} from "@/components/admin/AdminUI";
import { getStatsConsistencyDiagnostic } from "@/lib/admin/data";
import {
  emptyPlayerStatTotals,
  statsConsistencyMetrics,
} from "@/lib/stats-consistency";
import type { PlayerStatTotals, StatsConsistencyMetric } from "@/types";

export const metadata: Metadata = {
  title: "Admin - Diagnóstico de dados",
};

const metricLabels: Record<StatsConsistencyMetric, string> = {
  matches: "Jogos",
  goals: "Gols",
  assists: "Assistências",
  yellowCards: "Amarelos",
  redCards: "Vermelhos",
  cleanSheets: "Clean sheets",
  goalsConceded: "Gols sofridos",
};

function sumReportTotals(
  report: Awaited<ReturnType<typeof getStatsConsistencyDiagnostic>>,
  source: "calculated" | "historical",
) {
  return report.players.reduce<PlayerStatTotals>((totals, player) => {
    for (const metric of statsConsistencyMetrics) {
      totals[metric] += player[source][metric];
    }
    return totals;
  }, emptyPlayerStatTotals());
}

export default async function DataDiagnosticsPage() {
  const report = await getStatsConsistencyDiagnostic();
  const calculatedTotals = sumReportTotals(report, "calculated");
  const historicalTotals = sumReportTotals(report, "historical");
  const divergentPlayers = report.players.filter((player) => player.status !== "ok");

  return (
    <div>
      <AdminPageTitle
        eyebrow="Diagnóstico"
        title="Consistência das estatísticas"
        description="Compara a soma das competições e temporadas salvas no Supabase com a consolidação histórica importada."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Jogadores" value={report.totalPlayers} detail="analisados" />
        <AdminStatCard label="Sem divergência" value={report.matchingPlayers} detail="totais conciliados" />
        <AdminStatCard label="Divergentes" value={report.divergentPlayers} detail="requerem revisão" />
        <AdminStatCard label="Abas granulares" value={report.granularSheets.length} detail="fontes no banco" />
      </div>

      <AdminCard className="mt-6 overflow-hidden p-0">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-xl font-black text-zinc-950">Totais de jogadores</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Comparação agregada das linhas individuais, sem alterar automaticamente os dados divergentes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-4 py-3">Métrica</th>
                <th className="px-4 py-3 text-right">Soma granular</th>
                <th className="px-4 py-3 text-right">Histórico</th>
                <th className="px-4 py-3 text-right">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {statsConsistencyMetrics.map((metric) => (
                <tr key={metric}>
                  <td className="px-4 py-3 font-black text-zinc-950">
                    {metricLabels[metric]}
                  </td>
                  <td className="px-4 py-3 text-right">{calculatedTotals[metric]}</td>
                  <td className="px-4 py-3 text-right">{historicalTotals[metric]}</td>
                  <td className="px-4 py-3 text-right font-black">
                    {historicalTotals[metric] - calculatedTotals[metric]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard className="mt-6 overflow-hidden p-0">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-xl font-black text-zinc-950">Jogadores divergentes</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Diferença positiva indica que o histórico possui valor maior que a soma granular.
          </p>
        </div>
        {divergentPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Jogador</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Campos divergentes</th>
                  <th className="px-4 py-3">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {divergentPlayers.map((player) => (
                  <tr key={player.playerSlug}>
                    <td className="px-4 py-3">
                      <p className="font-black text-zinc-950">{player.nickname}</p>
                      <p className="mt-1 text-xs text-zinc-500">{player.fullName}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {player.status === "missing_historical"
                        ? "Ausente no histórico"
                        : player.status === "missing_granular"
                          ? "Ausente nas competições"
                          : "Divergente"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {player.differences.length > 0
                        ? player.differences
                            .map(
                              (difference) =>
                                `${metricLabels[difference.field]}: ${difference.calculated} / ${difference.historical} (${difference.difference > 0 ? "+" : ""}${difference.difference})`,
                            )
                            .join(" · ")
                        : "Cadastro sem par de validação"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="font-black text-[#9a6a12]"
                        href={`/jogadores/${player.playerSlug}`}
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-zinc-500">
            Todas as estatísticas estão conciliadas.
          </p>
        )}
      </AdminCard>
    </div>
  );
}

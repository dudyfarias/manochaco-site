import fs from "node:fs/promises";
import path from "node:path";
import {
  historicalPlayerStatLines,
  playerStatLines,
} from "../src/data";
import { buildStatsConsistencyReport } from "../src/lib/stats-consistency";
import {
  getCompetitionStatMappings,
  getValidationMappings,
} from "./config/sheet-mapping";

async function main() {
  const report = buildStatsConsistencyReport({
    sourceFile: "src/data/generated",
    granularSheets: getCompetitionStatMappings().map((mapping) => mapping.sheetName),
    validationSheets: getValidationMappings().map((mapping) => mapping.sheetName),
    statLines: playerStatLines,
    historicalLines: historicalPlayerStatLines,
  });

  console.log("Validação de consistência das estatísticas");
  console.log(`- jogadores analisados: ${report.totalPlayers}`);
  console.log(`- sem divergência: ${report.matchingPlayers}`);
  console.log(`- com divergência: ${report.divergentPlayers}`);
  console.log(`- abas granulares: ${report.granularSheets.join(", ")}`);
  console.log(`- abas de validação: ${report.validationSheets.join(", ")}`);
  console.log(`- chaves duplicadas: ${report.duplicateKeys.length}`);
  console.log(`- aliases inconsistentes: ${report.inconsistentAliases.length}`);

  for (const player of report.players.filter((item) => item.status !== "ok")) {
    console.warn(`\n${player.nickname} (${player.playerSlug}) - ${player.status}`);
    for (const difference of player.differences) {
      console.warn(
        `  ${difference.field}: campeonatos=${difference.calculated}, histórico=${difference.historical}, diferença=${difference.difference > 0 ? "+" : ""}${difference.difference}`,
      );
    }
  }

  for (const alias of report.inconsistentAliases) {
    console.warn(
      `Alias inconsistente ${alias.playerSlug}: nomes=[${alias.names.join(", ")}], apelidos=[${alias.nicknames.join(", ")}]`,
    );
  }

  const reportDirectory = path.join(process.cwd(), "data/reports");
  await fs.mkdir(reportDirectory, { recursive: true });
  await fs.writeFile(
    path.join(reportDirectory, "stats-consistency-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  if (report.duplicateKeys.length > 0) {
    console.error("Falha: existem linhas granulares duplicadas.");
    process.exit(1);
  }

  if (process.argv.includes("--strict") && report.divergentPlayers > 0) {
    console.error("Falha em modo estrito: existem divergências a revisar.");
    process.exit(1);
  }

  console.log("\nRelatório atualizado em data/reports/stats-consistency-report.json.");
}

void main();

import { matches as generatedMatches } from "./generated/matches.generated";
import { matches as fallbackMatches } from "./matches";

export { albums } from "./albums";
export { competitions } from "./generated/competitions.generated";
export { faceSuggestions } from "./faceSuggestions";
export { photoPlayers } from "./photoPlayers";
export { playerFaceReferences } from "./playerFaceReferences";
export { players } from "./generated/players.generated";
export { photos } from "./photos";
export { playerStatLines } from "./generated/player-stats.generated";
export { historicalPlayerStatLines } from "./generated/historical-player-stats.generated";
export { seasonValidationStatLines } from "./generated/season-validation-stats.generated";
export { statsConsistencyReport } from "./generated/stats-consistency.generated";
export { seasons } from "./generated/seasons.generated";
export { staffMembers } from "./staff";
export { clubStats, stats } from "./generated/stats.generated";
export {
  appearancesRanking,
  assistsRanking,
  cardRanking,
  goalParticipationRanking,
  scoringRanking,
} from "./generated/rankings.generated";

const scheduledFallbackMatches = fallbackMatches.filter(
  (match) =>
    match.status === "scheduled" &&
    !generatedMatches.some((generatedMatch) => generatedMatch.slug === match.slug),
);

export const matches = [...generatedMatches, ...scheduledFallbackMatches];

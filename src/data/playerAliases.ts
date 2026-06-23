export type PlayerAliasDefinition = {
  canonicalSlug: string;
  aliases: string[];
};

export const playerAliasDefinitions: PlayerAliasDefinition[] = [
  { canonicalSlug: "torres", aliases: ["TORRES", "Alexandre Torres"] },
  { canonicalSlug: "dudu", aliases: ["DUDU", "Luiz Eduardo"] },
  { canonicalSlug: "bruninho", aliases: ["BRUNINHO", "Bruno Guidotte"] },
  { canonicalSlug: "pedrinho", aliases: ["PEDRINHO", "Pedro Guidotte"] },
  { canonicalSlug: "madeus", aliases: ["MADEUS", "Matheus de Paula"] },
  { canonicalSlug: "nikollas", aliases: ["NIKOLLAS", "Nikollas Javier"] },
  { canonicalSlug: "ed-gou", aliases: ["ED GOU", "Eduardo Gouveia"] },
  { canonicalSlug: "victor-erik", aliases: ["VICTOR ERIK", "Victor Erik"] },
  {
    canonicalSlug: "raphael-casanova",
    aliases: ["CASANOVA", "Raphael Casanova"],
  },
  { canonicalSlug: "andre-gouveia", aliases: ["DED", "André Gouveia"] },
  { canonicalSlug: "de-marco", aliases: ["DE MARCO", "Caleb de Marco"] },
  { canonicalSlug: "carlos-jr", aliases: ["CARLOS JR", "Carlos Souza"] },
  { canonicalSlug: "pe-lima", aliases: ["PE LIMA", "Pedro Lima"] },
  { canonicalSlug: "jf-fagundes", aliases: ["JF FAGUNDES"] },
  {
    canonicalSlug: "john",
    aliases: ["JOHN", "GRANDO", "João Grando"],
  },
];

export function normalizePlayerAlias(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugifyPlayerAlias(value: string) {
  return normalizePlayerAlias(value).replace(/\s+/g, "-");
}

const playerSlugByAlias = new Map(
  playerAliasDefinitions.flatMap((definition) =>
    definition.aliases.map(
      (alias) => [normalizePlayerAlias(alias), definition.canonicalSlug] as const,
    ),
  ),
);

export function resolveCanonicalPlayerSlug(fullName: string, nickname: string) {
  const candidates = [nickname, fullName, `${fullName} ${nickname}`];

  for (const candidate of candidates) {
    const canonicalSlug = playerSlugByAlias.get(normalizePlayerAlias(candidate));
    if (canonicalSlug) return canonicalSlug;
  }

  return slugifyPlayerAlias(nickname || fullName);
}

export function getAliasesForPlayer(
  player: { slug: string; fullName: string; nickname: string },
) {
  const configured = playerAliasDefinitions.find(
    (definition) => definition.canonicalSlug === player.slug,
  )?.aliases ?? [];

  return [...new Set([player.fullName, player.nickname, ...configured])];
}

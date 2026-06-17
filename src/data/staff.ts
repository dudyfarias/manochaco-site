import type { StaffMember } from "@/types";

export const staffMembers: StaffMember[] = [
  {
    id: "staff-raphael-casanova",
    name: "Raphael Casanova",
    slug: "raphael-casanova",
    playerSlug: "raphael-casanova",
    role: "Técnico",
    period: "Comissão atual",
    status: "current",
    image: "/players/raphael-casanova.jpg",
    summary:
      "Técnico atual do Manochaco e também ex-jogador do clube, responsável por organizar o time, orientar o elenco e conduzir a equipe nos jogos.",
    highlights: [
      "Comissão atual",
      "Ex-jogador",
      "Plano de jogo",
      "Gestão do elenco",
    ],
  },
  {
    id: "staff-andre-gouveia",
    name: "André Gouveia",
    slug: "andre-gouveia",
    playerSlug: "andre-gouveia",
    role: "Ex-técnico",
    period: "Passagem anterior",
    status: "former",
    image: "/players/andre-gouveia.jpg",
    summary:
      "Antigo técnico e também ex-jogador do Manochaco, parte do histórico de organização e evolução competitiva do clube.",
    highlights: ["Histórico técnico", "Ex-jogador", "Organização", "Ciclo anterior"],
  },
];

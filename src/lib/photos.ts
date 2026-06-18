import type { FaceRecognitionStatus, PhotoCategory } from "@/types";

export const photoCategoryLabels: Record<PhotoCategory, string> = {
  match: "Jogos",
  team: "Jogadores",
  training: "Treinos",
  backstage: "Bastidores",
  title: "Títulos",
  general: "Geral",
};

export const faceRecognitionStatusLabels: Record<FaceRecognitionStatus, string> = {
  not_processed: "Não processada",
  processing: "Em processamento",
  processed: "Processada",
  needs_review: "Revisão pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

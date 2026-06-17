import type { FaceDetectionSuggestion } from "@/types";

export const faceSuggestions: FaceDetectionSuggestion[] = [
  {
    id: "suggestion-001",
    photoId: "photo-panelinha-2024",
    suggestedPlayerId: "player-nikollas",
    suggestedPlayerSlug: "nikollas",
    confidence: 0.72,
    boundingBox: {
      x: 38,
      y: 18,
      width: 10,
      height: 18,
    },
    status: "pending",
  },
  {
    id: "suggestion-002",
    photoId: "photo-chuteira-2025",
    suggestedPlayerId: "player-andre-gouveia",
    suggestedPlayerSlug: "andre-gouveia",
    confidence: 0.86,
    boundingBox: {
      x: 25,
      y: 20,
      width: 12,
      height: 18,
    },
    status: "pending",
  },
  {
    id: "suggestion-003",
    photoId: "photo-treino-2025",
    suggestedPlayerId: "player-pedrinho",
    suggestedPlayerSlug: "pedrinho",
    confidence: 0.58,
    boundingBox: {
      x: 62,
      y: 28,
      width: 9,
      height: 15,
    },
    status: "pending",
  },
  {
    id: "suggestion-004",
    photoId: "photo-expulsos-2024",
    suggestedPlayerId: "player-madeus",
    suggestedPlayerSlug: "madeus",
    confidence: 0.94,
    boundingBox: {
      x: 64,
      y: 21,
      width: 10,
      height: 18,
    },
    status: "confirmed",
  },
];

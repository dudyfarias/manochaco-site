import type { PlayerFaceReference } from "@/types";

export const playerFaceReferences: PlayerFaceReference[] = [
  {
    id: "face-ref-dudu-001",
    playerId: "player-dudu",
    playerSlug: "dudu",
    imageUrl: "/players/dudu.png",
    approvedForRecognition: true,
    consentGiven: true,
    createdAt: "2026-06-17T13:00:00-03:00",
  },
  {
    id: "face-ref-torres-001",
    playerId: "player-torres",
    playerSlug: "torres",
    imageUrl: "/players/torres.png",
    approvedForRecognition: true,
    consentGiven: true,
    createdAt: "2026-06-17T13:01:00-03:00",
  },
  {
    id: "face-ref-bruninho-001",
    playerId: "player-bruninho",
    playerSlug: "bruninho",
    imageUrl: "/players/bruninho.png",
    approvedForRecognition: true,
    consentGiven: true,
    createdAt: "2026-06-17T13:02:00-03:00",
  },
  {
    id: "face-ref-nikollas-001",
    playerId: "player-nikollas",
    playerSlug: "nikollas",
    imageUrl: "/players/nikollas.png",
    approvedForRecognition: false,
    consentGiven: false,
    createdAt: "2026-06-17T13:03:00-03:00",
  },
];

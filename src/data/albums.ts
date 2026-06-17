import type { Album } from "@/types";

export const albums: Album[] = [
  {
    id: "album-time",
    slug: "time",
    title: "Foto oficial",
    description: "Retratos do elenco e identidade visual preto e dourada.",
    coverImage: "/photos/photo-6.png",
    photoIds: ["photo-6"],
    date: "2024-10-20T16:00:00-03:00",
  },
  {
    id: "album-liga7-2024",
    slug: "liga7-2024",
    title: "Liga7 Playball",
    description: "Jogos, resultados e bastidores da trajetória na Playball.",
    coverImage: "/photos/photo-2.png",
    photoIds: ["photo-2", "photo-3"],
    date: "2024-11-09T18:00:00-03:00",
  },
  {
    id: "album-bastidores-2024",
    slug: "bastidores-2024",
    title: "Bastidores 2024",
    description: "Aquecimento, vestiário e momentos de grupo.",
    coverImage: "/photos/photo-1.png",
    photoIds: ["photo-1", "photo-5"],
    date: "2024-10-05T18:00:00-03:00",
  },
  {
    id: "album-titulos",
    slug: "titulos",
    title: "Títulos e campanhas",
    description: "Memórias das taças e campanhas marcantes do Manochaco.",
    coverImage: "/photos/photo-4.png",
    photoIds: ["photo-4"],
    date: "2023-06-04T20:00:00-03:00",
  },
];

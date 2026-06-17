import type { Metadata } from "next";
import { AlbumCard } from "@/components/AlbumCard";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { albums } from "@/data/albums";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Galeria de fotos do Clube Atlético Manochaco com simulação de marcação de jogadores.",
};

export default function GaleriaPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Galeria"
            title="Fotos, álbuns e marcações"
            description="A primeira fase simula a relação foto-jogador. Depois, essa base pode receber upload, álbuns, revisão humana e Storage."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Álbuns"
          title="Coleções do Manochaco"
          description="Organização pensada para temporadas, competições, bastidores e conquistas."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Fotos"
            title="Marcações simuladas"
            description="As etiquetas abaixo são geradas pela estrutura mockada `photoPlayers`, preparada para virar tabela relacional no futuro."
          />
          <div className="mt-10">
            <PhotoGrid photos={photos} />
          </div>
        </div>
      </section>
    </div>
  );
}

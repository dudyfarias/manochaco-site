import type { Metadata } from "next";
import {
  AdminButtonLink,
  AdminCard,
  AdminPageTitle,
} from "@/components/admin/AdminUI";

export const metadata: Metadata = {
  title: "Admin - Galeria",
};

export default function AdminGalleryIndexPage() {
  return (
    <div>
      <AdminPageTitle
        eyebrow="Galeria"
        title="Gestão do acervo"
        description="Organize álbuns, fotos, marcações e revisão de IA."
      />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <AdminCard>
          <h2 className="text-2xl font-black">Álbuns</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Crie álbuns e vincule a jogos, campeonatos e temporadas.
          </p>
          <div className="mt-5">
            <AdminButtonLink href="/admin/galeria/albuns">Gerenciar álbuns</AdminButtonLink>
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="text-2xl font-black">Fotos</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Envie fotos para Supabase Storage e marque jogadores manualmente.
          </p>
          <div className="mt-5">
            <AdminButtonLink href="/admin/galeria/fotos">Gerenciar fotos</AdminButtonLink>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

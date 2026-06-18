import type { Metadata } from "next";
import {
  AdminButtonLink,
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  AdminStatCard,
} from "@/components/admin/AdminUI";
import {
  listAdminAlbums,
  listAdminMatches,
  listAdminPhotos,
  listAdminPlayers,
  listPendingFaceSuggestions,
} from "@/lib/admin/data";

type AdminDashboardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Dashboard administrativo",
};

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const params = await searchParams;
  let dashboardData:
    | Awaited<
        ReturnType<
          typeof Promise.all<[
            ReturnType<typeof listAdminPlayers>,
            ReturnType<typeof listAdminMatches>,
            ReturnType<typeof listAdminPhotos>,
            ReturnType<typeof listAdminAlbums>,
            ReturnType<typeof listPendingFaceSuggestions>,
          ]>
        >
      >
    | null = null;
  let loadError: unknown = null;

  try {
    dashboardData = await Promise.all([
      listAdminPlayers(),
      listAdminMatches(),
      listAdminPhotos(),
      listAdminAlbums(),
      listPendingFaceSuggestions(),
    ]);
  } catch (error) {
    loadError = error;
  }

  if (loadError || !dashboardData) {
    return (
      <div>
        <AdminPageTitle
          eyebrow="Dashboard"
          title="Painel administrativo"
          description="Não foi possível consultar os dados administrativos."
        />
        <AdminEmptyState
          title="Erro de conexão"
          description={loadError instanceof Error ? loadError.message : "Verifique Supabase e RLS."}
        />
      </div>
    );
  }

  const [players, matches, photos, albums, suggestions] = dashboardData;
  const latestMatches = matches.slice(0, 5);
  const latestPhotos = photos.slice(0, 5);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Dashboard"
        title="Painel administrativo"
        description="Gerencie a base oficial do Manochaco no Supabase. A planilha fica apenas como migração inicial."
        action={<AdminButtonLink href="/admin/jogadores/novo">Novo jogador</AdminButtonLink>}
      />
      <AdminNotice searchParams={params} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Jogadores" value={players.length} detail="cadastrados" />
        <AdminStatCard label="Jogos" value={matches.length} detail="no banco" />
        <AdminStatCard label="Fotos" value={photos.length} detail="no acervo" />
        <AdminStatCard label="Álbuns" value={albums.length} detail="organizados" />
        <AdminStatCard label="Revisão IA" value={suggestions.length} detail="pendentes" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Últimos jogos</h2>
            <AdminButtonLink href="/admin/jogos/novo" tone="secondary">
              Novo jogo
            </AdminButtonLink>
          </div>
          <div className="mt-5 divide-y divide-zinc-100">
            {latestMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-black text-zinc-950">Manochaco x {match.opponent}</p>
                  <p className="text-sm text-zinc-500">
                    {match.date ?? "Sem data"} · {match.stage ?? "Sem fase"}
                  </p>
                </div>
                <p className="text-lg font-black">
                  {match.manochaco_score} x {match.opponent_score}
                </p>
              </div>
            ))}
            {latestMatches.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">Nenhum jogo cadastrado.</p>
            ) : null}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Últimas fotos</h2>
            <AdminButtonLink href="/admin/galeria/fotos" tone="secondary">
              Enviar foto
            </AdminButtonLink>
          </div>
          <div className="mt-5 divide-y divide-zinc-100">
            {latestPhotos.map((photo) => (
              <div key={photo.id} className="py-3">
                <p className="font-black text-zinc-950">{photo.title}</p>
                <p className="text-sm text-zinc-500">
                  {photo.category} · {photo.is_public === false ? "privada" : "pública"}
                </p>
              </div>
            ))}
            {latestPhotos.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">Nenhuma foto cadastrada.</p>
            ) : null}
          </div>
        </AdminCard>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminButtonLink href="/admin/jogadores/novo">Novo jogador</AdminButtonLink>
        <AdminButtonLink href="/admin/jogos/novo">Novo jogo</AdminButtonLink>
        <AdminButtonLink href="/admin/galeria/albuns">Novo álbum</AdminButtonLink>
        <AdminButtonLink href="/admin/galeria/fotos">Enviar foto</AdminButtonLink>
        <AdminButtonLink href="/admin/fotos/revisao">Revisar IA</AdminButtonLink>
      </div>
    </div>
  );
}

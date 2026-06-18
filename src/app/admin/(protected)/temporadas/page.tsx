import type { Metadata } from "next";
import {
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SubmitButton,
} from "@/components/admin/AdminUI";
import { saveSeason } from "@/lib/admin/actions";
import { listAdminSeasons } from "@/lib/admin/data";

type SeasonsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Temporadas",
};

export default async function AdminSeasonsPage({ searchParams }: SeasonsPageProps) {
  const [params, seasons] = await Promise.all([searchParams, listAdminSeasons()]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Temporadas"
        title="Temporadas"
        description="Gerencie anos e períodos usados nos filtros de jogos, estatísticas e fotos."
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <h2 className="text-xl font-black">Criar temporada</h2>
        <form action={saveSeason} className="mt-5 grid gap-5 md:grid-cols-5">
          <Field label="Ano" name="year" type="number" required />
          <Field label="Nome" name="name" required />
          <Field label="Slug" name="slug" />
          <Field label="Início" name="start_date" type="date" />
          <Field label="Fim" name="end_date" type="date" />
          <div className="md:col-span-5">
            <SubmitButton>Criar temporada</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <div className="mt-6 grid gap-4">
        {seasons.map((season) => (
          <AdminCard key={season.id}>
            <form action={saveSeason} className="grid gap-4 md:grid-cols-5">
              <input type="hidden" name="id" value={season.id} />
              <Field label="Ano" name="year" type="number" defaultValue={season.year} required />
              <Field label="Nome" name="name" defaultValue={season.name} required />
              <Field label="Slug" name="slug" defaultValue={season.slug} />
              <Field label="Início" name="start_date" type="date" defaultValue={season.start_date} />
              <Field label="Fim" name="end_date" type="date" defaultValue={season.end_date} />
              <div className="md:col-span-5">
                <SubmitButton>Salvar temporada</SubmitButton>
              </div>
            </form>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

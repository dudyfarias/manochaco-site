import type { Metadata } from "next";
import {
  AdminButtonLink,
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import { createMatch } from "@/lib/admin/actions";
import { listAdminCompetitions, listAdminSeasons } from "@/lib/admin/data";

type NewMatchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Novo jogo",
};

export default async function NewMatchPage({ searchParams }: NewMatchPageProps) {
  const [params, competitions, seasons] = await Promise.all([
    searchParams,
    listAdminCompetitions(),
    listAdminSeasons(),
  ]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogos"
        title="Cadastrar nova partida"
        description="O resultado é calculado automaticamente a partir do placar."
        action={<AdminButtonLink href="/admin/jogos" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <form action={createMatch} className="grid gap-5 md:grid-cols-2">
          <Field label="Adversário" name="opponent" required />
          <Field label="Slug" name="slug" placeholder="gerado automaticamente se vazio" />
          <Field label="Data" name="date" type="date" />
          <SelectField label="Campeonato" name="competition_id">
            <option value="">A definir</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Temporada" name="season_id">
            <option value="">A definir</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </SelectField>
          <Field label="Fase" name="stage" />
          <Field label="Local" name="location" />
          <Field label="Imagem de capa" name="cover_image_url" />
          <Field label="Gols Manochaco" name="manochaco_score" type="number" defaultValue={0} />
          <Field label="Gols adversário" name="opponent_score" type="number" defaultValue={0} />
          <div className="md:col-span-2">
            <TextAreaField label="Resumo" name="summary" />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Criar jogo</SubmitButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

import type { Metadata } from "next";
import {
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import { saveCompetition } from "@/lib/admin/actions";
import { listAdminCompetitions } from "@/lib/admin/data";

type CompetitionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Campeonatos",
};

export default async function AdminCompetitionsPage({
  searchParams,
}: CompetitionsPageProps) {
  const [params, competitions] = await Promise.all([
    searchParams,
    listAdminCompetitions(),
  ]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Campeonatos"
        title="Competições"
        description="Gerencie Liga7 Playball, Copa FutFudas, Copa Amstel, Chuteira e futuras competições."
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <h2 className="text-xl font-black">Criar campeonato</h2>
        <form action={saveCompetition} className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Nome" name="name" required />
          <Field label="Slug" name="slug" />
          <Field label="Nome curto" name="short_name" />
          <SelectField label="Tipo" name="type" defaultValue="other">
            <option value="league">Liga</option>
            <option value="cup">Copa</option>
            <option value="friendly">Amistoso</option>
            <option value="other">Outro</option>
          </SelectField>
          <div className="md:col-span-2">
            <TextAreaField label="Descrição" name="description" />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Criar campeonato</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <div className="mt-6 grid gap-4">
        {competitions.map((competition) => (
          <AdminCard key={competition.id}>
            <form action={saveCompetition} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="id" value={competition.id} />
              <Field label="Nome" name="name" defaultValue={competition.name} required />
              <Field label="Slug" name="slug" defaultValue={competition.slug} />
              <Field label="Nome curto" name="short_name" defaultValue={competition.short_name} />
              <SelectField label="Tipo" name="type" defaultValue={competition.type}>
                <option value="league">Liga</option>
                <option value="cup">Copa</option>
                <option value="friendly">Amistoso</option>
                <option value="other">Outro</option>
              </SelectField>
              <div className="md:col-span-4">
                <TextAreaField
                  label="Descrição"
                  name="description"
                  defaultValue={competition.description}
                  rows={2}
                />
              </div>
              <div className="md:col-span-4">
                <SubmitButton>Salvar campeonato</SubmitButton>
              </div>
            </form>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

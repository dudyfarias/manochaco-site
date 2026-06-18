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
import { createPlayer } from "@/lib/admin/actions";

type NewPlayerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Novo jogador",
};

export default async function NewPlayerPage({ searchParams }: NewPlayerPageProps) {
  const params = await searchParams;

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogadores"
        title="Adicionar jogador"
        description="Cadastre um atleta, ex-jogador ou membro da comissão técnica."
        action={<AdminButtonLink href="/admin/jogadores" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <form action={createPlayer} className="grid gap-5 md:grid-cols-2">
          <Field label="Nome completo" name="name" required />
          <Field label="Apelido" name="nickname" required />
          <Field label="Slug" name="slug" placeholder="gerado pelo apelido se vazio" />
          <SelectField label="Posição" name="position">
            <option value="">A definir</option>
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Ala">Ala</option>
            <option value="Meio Campo">Meio Campo</option>
            <option value="Atacante">Atacante</option>
          </SelectField>
          <Field label="Número" name="shirt_number" type="number" />
          <Field label="Pé dominante" name="dominant_foot" />
          <SelectField label="Status" name="status" defaultValue="active">
            <option value="active">Ativo</option>
            <option value="former">Ex-jogador</option>
            <option value="staff">Comissão</option>
          </SelectField>
          <Field label="Foto principal" name="profile_image_url" placeholder="/players/dudu.png" />
          <div className="md:col-span-2">
            <TextAreaField label="Bio" name="bio" />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Criar jogador</SubmitButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

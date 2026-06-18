import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { deactivatePlayer, updatePlayer } from "@/lib/admin/actions";
import { getAdminPlayer } from "@/lib/admin/data";

type EditPlayerPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Editar jogador",
};

export default async function EditPlayerPage({
  params,
  searchParams,
}: EditPlayerPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const player = await getAdminPlayer(id);

  if (!player) {
    notFound();
  }

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogadores"
        title={`Editar ${player.nickname}`}
        description="Atualize os dados oficiais do jogador no Supabase."
        action={<AdminButtonLink href="/admin/jogadores" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={resolvedSearchParams} />

      <AdminCard className="mt-6">
        <form action={updatePlayer} className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={player.id} />
          <Field label="Nome completo" name="name" defaultValue={player.name} required />
          <Field label="Apelido" name="nickname" defaultValue={player.nickname} required />
          <Field label="Slug" name="slug" defaultValue={player.slug} />
          <SelectField label="Posição" name="position" defaultValue={player.position}>
            <option value="">A definir</option>
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Ala">Ala</option>
            <option value="Meio Campo">Meio Campo</option>
            <option value="Atacante">Atacante</option>
          </SelectField>
          <Field label="Número" name="shirt_number" type="number" defaultValue={player.shirt_number} />
          <Field label="Pé dominante" name="dominant_foot" defaultValue={player.dominant_foot} />
          <SelectField label="Status" name="status" defaultValue={player.status}>
            <option value="active">Ativo</option>
            <option value="former">Ex-jogador</option>
            <option value="staff">Comissão</option>
          </SelectField>
          <Field label="Foto principal" name="profile_image_url" defaultValue={player.profile_image_url} />
          <div className="md:col-span-2">
            <TextAreaField label="Bio" name="bio" defaultValue={player.bio} />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <SubmitButton>Salvar jogador</SubmitButton>
          </div>
        </form>
        <form action={deactivatePlayer} className="mt-4">
          <input type="hidden" name="id" value={player.id} />
          <button className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-black text-zinc-700 transition hover:border-red-300 hover:text-red-700">
            Marcar como ex-jogador
          </button>
        </form>
      </AdminCard>
    </div>
  );
}

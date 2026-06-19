import type { Metadata } from "next";
import Link from "next/link";
import {
  AccountField,
  AccountNotice,
  AccountSubmitButton,
  AccountTextArea,
} from "@/components/account/AccountUI";
import { logoutAccount, updateAccountProfile } from "@/lib/account/actions";
import { requireAccount } from "@/lib/account/data";
import { accountTypeLabels, memberStatusLabels } from "@/lib/account/types";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Minha conta",
};

export const dynamic = "force-dynamic";

function errorMessage(error: string) {
  if (error === "not-admin") return "Sua conta não possui permissão administrativa.";
  if (error === "invalid-birth-year") return "Informe um ano de nascimento válido.";
  if (error === "invalid-data") return "Revise os dados obrigatórios.";
  return "Não foi possível salvar suas alterações.";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const context = await requireAccount();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const saved = typeof params.saved === "string" ? params.saved : "";
  const welcome = params.welcome === "1";
  const currentYear = new Date().getFullYear();

  return (
    <section className="bg-[#f4f1e8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-zinc-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#9a6a12]">Área do usuário</p>
            <h1 className="mt-2 text-4xl font-black text-zinc-950">Minha conta</h1>
            <p className="mt-3 text-sm text-zinc-600">{context.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {context.admin ? (
              <Link href="/admin" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-4 py-2 text-sm font-black text-black hover:bg-[#f0c35d]">
                Abrir painel admin
              </Link>
            ) : null}
            <form action={logoutAccount}>
              <button className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 hover:border-[#d1a137]">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {error ? <AccountNotice>{errorMessage(error)}</AccountNotice> : null}
          {saved ? <AccountNotice tone="success">Alteração salva com sucesso.</AccountNotice> : null}
          {welcome ? <AccountNotice tone="success">Conta criada com sucesso. Bem-vindo ao portal do Manochaco.</AccountNotice> : null}
        </div>

        {context.member ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="rounded-lg bg-zinc-950 p-6 text-white">
              <p className="text-xs font-black uppercase text-[#d1a137]">Seu cadastro</p>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-xs font-bold uppercase text-zinc-500">Perfil</dt>
                  <dd className="mt-1 text-lg font-black">{accountTypeLabels[context.member.accountType]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-zinc-500">Status</dt>
                  <dd className="mt-1 text-lg font-black">{memberStatusLabels[context.member.status]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-zinc-500">Vínculo com jogador</dt>
                  <dd className="mt-1 text-sm font-bold text-zinc-300">
                    {context.member.linkedPlayerId ? "Confirmado pelo clube" : "Ainda não vinculado"}
                  </dd>
                </div>
              </dl>
              {context.member.status === "pending" ? (
                <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-zinc-400">
                  A administração analisará seu pedido. Você não precisa criar outra conta.
                </p>
              ) : null}
            </aside>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-black text-zinc-950">Dados pessoais</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Estes dados são privados e podem ser atualizados por você.
              </p>
              <form action={updateAccountProfile} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AccountField label="Nome completo" name="full_name" required minLength={2} maxLength={120} defaultValue={context.member.fullName} />
                  <AccountField label="Telefone" name="phone" type="tel" autoComplete="tel" maxLength={30} defaultValue={context.member.phone} />
                  <AccountField label="Cidade" name="city" autoComplete="address-level2" maxLength={100} defaultValue={context.member.city} />
                  <AccountField label="Posição preferida" name="preferred_position" maxLength={60} defaultValue={context.member.preferredPosition} />
                  <AccountField label="Ano de nascimento" name="birth_year" type="number" min={1940} max={currentYear} defaultValue={context.member.birthYear} />
                </div>
                <AccountTextArea label="Mensagem para o clube" name="message" defaultValue={context.member.message} />
                <AccountSubmitButton>Salvar dados</AccountSubmitButton>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-black text-zinc-950">Conta administrativa</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Esta conta não possui um perfil público de membro. Use o painel administrativo para as atividades do clube.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

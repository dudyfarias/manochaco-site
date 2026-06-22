import type { Metadata } from "next";
import Link from "next/link";
import {
  AccountField,
  AccountNotice,
  AccountShell,
  AccountSubmitButton,
  AccountTextLink,
} from "@/components/account/AccountUI";
import { registerAccount } from "@/lib/account/actions";
import { accountTypeLabels, accountTypes } from "@/lib/account/types";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Cadastre-se",
  description: "Crie sua conta no portal oficial do Clube Atlético Manochaco.",
};

const accountDescriptions = {
  supporter: "Acompanhe o clube e os próximos recursos da comunidade.",
  player: "Solicite a vinculação da sua conta a um jogador do elenco histórico.",
  candidate: "Envie seu interesse para participar dos processos do time.",
  partner: "Cadastre-se como parceiro, patrocinador ou colaborador.",
};

function errorMessage(error: string) {
  const messages: Record<string, string> = {
    "missing-env": "O cadastro ainda não está configurado neste ambiente.",
    "invalid-data": "Revise seu nome e e-mail.",
    "weak-password": "A senha deve ter pelo menos 8 caracteres.",
    "password-mismatch": "As senhas informadas não são iguais.",
    "privacy-required": "É necessário aceitar a política de privacidade.",
    "invalid-birth-date": "Informe uma data de nascimento válida.",
    "signup-failed": "Não foi possível concluir o cadastro. Se você já possui conta, tente entrar ou recuperar a senha.",
  };

  return messages[error] ?? "Não foi possível concluir o cadastro.";
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AccountShell
      eyebrow="Comunidade Manochaco"
      title="Crie sua conta"
      description="Escolha como você se relaciona com o clube. Pedidos de jogador, candidato e parceiro passam por análise da administração."
      aside={
        <div>
          <p className="text-xs font-black uppercase text-[#d1a137]">Acesso responsável</p>
          <h2 className="mt-3 text-3xl font-black">Cada perfil no lugar certo.</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Administradores não são criados por este formulário. Esse acesso é concedido
            internamente pelo clube, com permissões próprias e registro separado.
          </p>
          <p className="mt-6 text-sm leading-6 text-zinc-400">
            Seus dados de cadastro são privados e usados apenas para conta, contato e
            análise do vínculo solicitado.
          </p>
        </div>
      }
    >
      {error ? <AccountNotice>{errorMessage(error)}</AccountNotice> : null}
      <form action={registerAccount} className="mt-6 space-y-6">
        <fieldset>
          <legend className="text-xs font-black uppercase text-zinc-500">
            Quero me cadastrar como
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {accountTypes.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer gap-3 rounded-md border border-zinc-200 p-4 transition hover:border-[#d1a137] has-[:checked]:border-[#d1a137] has-[:checked]:bg-amber-50"
              >
                <input
                  type="radio"
                  name="account_type"
                  value={type}
                  defaultChecked={type === "supporter"}
                  className="mt-1 accent-[#9a6a12]"
                />
                <span>
                  <span className="block text-sm font-black text-zinc-950">
                    {accountTypeLabels[type]}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    {accountDescriptions[type]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <AccountField label="Nome completo" name="full_name" required minLength={2} maxLength={120} />
          <AccountField label="E-mail" name="email" type="email" required autoComplete="email" />
          <AccountField label="Telefone" name="phone" type="tel" autoComplete="tel" maxLength={30} />
          <AccountField label="Cidade" name="city" autoComplete="address-level2" maxLength={100} />
          <AccountField label="Posição preferida" name="preferred_position" maxLength={60} placeholder="Ex.: atacante" />
          <AccountField label="Data de nascimento" name="birth_date" type="date" min="1940-01-01" max={today} autoComplete="bday" />
          <AccountField label="Senha" name="password" type="password" required autoComplete="new-password" minLength={8} maxLength={128} />
          <AccountField label="Confirmar senha" name="password_confirmation" type="password" required autoComplete="new-password" minLength={8} maxLength={128} />
        </div>

        <label className="flex gap-3 text-sm leading-6 text-zinc-600">
          <input type="checkbox" name="privacy_accepted" required className="mt-1 accent-[#9a6a12]" />
          <span>
            Li e aceito os cuidados de privacidade e o uso dos meus dados para criação da
            conta e contato do clube, conforme a <Link href="/privacidade" className="font-bold text-[#8a5b0b] hover:text-black">política de privacidade</Link>.
          </span>
        </label>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AccountSubmitButton>Criar conta</AccountSubmitButton>
          <p className="text-sm text-zinc-600">
            Já tem conta? <AccountTextLink href="/entrar">Entrar</AccountTextLink>
          </p>
        </div>
      </form>
    </AccountShell>
  );
}

import type { Metadata } from "next";
import {
  AccountField,
  AccountNotice,
  AccountShell,
  AccountSubmitButton,
  AccountTextLink,
} from "@/components/account/AccountUI";
import { loginAccount } from "@/lib/account/actions";
import { safeInternalPath } from "@/lib/account/utils";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta do Clube Atlético Manochaco.",
};

function errorMessage(error: string) {
  if (error === "missing-env") return "O acesso ainda não está configurado neste ambiente.";
  if (error === "confirmation") return "O link de confirmação expirou ou é inválido.";
  return "E-mail ou senha inválidos.";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const loggedOut = params.loggedOut === "1";
  const next = safeInternalPath(
    typeof params.next === "string" ? params.next : null,
    "/conta",
  );

  return (
    <AccountShell
      eyebrow="Acesso Manochaco"
      title="Entre na sua conta"
      description="O mesmo acesso atende torcedores, jogadores, candidatos, parceiros e administradores autorizados."
    >
      {error ? <AccountNotice>{errorMessage(error)}</AccountNotice> : null}
      {loggedOut ? (
        <div className="mt-4">
          <AccountNotice tone="success">Sessão encerrada com sucesso.</AccountNotice>
        </div>
      ) : null}
      <form action={loginAccount} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <AccountField
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AccountField
          label="Senha"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AccountSubmitButton>Entrar</AccountSubmitButton>
          <AccountTextLink href="/recuperar-senha">Esqueci minha senha</AccountTextLink>
        </div>
      </form>
      <p className="mt-7 border-t border-zinc-200 pt-5 text-sm text-zinc-600">
        Ainda não tem acesso? <AccountTextLink href="/cadastro">Cadastre-se</AccountTextLink>
      </p>
    </AccountShell>
  );
}

import type { Metadata } from "next";
import {
  AccountField,
  AccountNotice,
  AccountShell,
  AccountSubmitButton,
  AccountTextLink,
} from "@/components/account/AccountUI";
import { requestPasswordReset } from "@/lib/account/actions";

type ResetPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default async function ResetPage({ searchParams }: ResetPageProps) {
  const params = await searchParams;
  const success = params.success === "1";
  const missingEnv = params.error === "missing-env";

  return (
    <AccountShell
      eyebrow="Segurança da conta"
      title="Recupere sua senha"
      description="Informe o e-mail cadastrado. Se a conta existir, você receberá um link seguro para criar uma nova senha."
    >
      {success ? (
        <AccountNotice tone="success">
          Solicitação recebida. Verifique seu e-mail e a pasta de spam.
        </AccountNotice>
      ) : null}
      {missingEnv ? (
        <AccountNotice>O acesso ainda não está configurado neste ambiente.</AccountNotice>
      ) : null}
      <form action={requestPasswordReset} className="mt-6 space-y-4">
        <AccountField label="E-mail" name="email" type="email" required autoComplete="email" />
        <AccountSubmitButton>Enviar link</AccountSubmitButton>
      </form>
      <p className="mt-6 text-sm">
        <AccountTextLink href="/entrar">Voltar para entrar</AccountTextLink>
      </p>
    </AccountShell>
  );
}

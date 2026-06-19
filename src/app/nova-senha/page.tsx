import type { Metadata } from "next";
import {
  AccountField,
  AccountNotice,
  AccountShell,
  AccountSubmitButton,
} from "@/components/account/AccountUI";
import { updateAccountPassword } from "@/lib/account/actions";
import { requireAccount } from "@/lib/account/data";

type NewPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Nova senha",
};

function errorMessage(error: string) {
  if (error === "weak-password") return "A senha deve ter pelo menos 8 caracteres.";
  if (error === "password-mismatch") return "As senhas informadas não são iguais.";
  return "Não foi possível atualizar a senha.";
}

export default async function NewPasswordPage({ searchParams }: NewPasswordPageProps) {
  await requireAccount();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <AccountShell
      eyebrow="Segurança da conta"
      title="Crie uma nova senha"
      description="Use pelo menos 8 caracteres e escolha uma senha exclusiva para sua conta Manochaco."
    >
      {error ? <AccountNotice>{errorMessage(error)}</AccountNotice> : null}
      <form action={updateAccountPassword} className="mt-6 space-y-4">
        <AccountField label="Nova senha" name="password" type="password" required autoComplete="new-password" minLength={8} maxLength={128} />
        <AccountField label="Confirmar nova senha" name="password_confirmation" type="password" required autoComplete="new-password" minLength={8} maxLength={128} />
        <AccountSubmitButton>Atualizar senha</AccountSubmitButton>
      </form>
    </AccountShell>
  );
}

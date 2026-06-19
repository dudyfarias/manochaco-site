import type { Metadata } from "next";
import {
  AccountNotice,
  AccountShell,
  AccountTextLink,
} from "@/components/account/AccountUI";

type ConfirmationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Confirme seu cadastro",
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "seu e-mail";

  return (
    <AccountShell
      eyebrow="Cadastro recebido"
      title="Confirme seu e-mail"
      description="Enviamos um link para validar sua conta antes do primeiro acesso."
    >
      <AccountNotice tone="success">
        Verifique a caixa de entrada de {email}. O link também pode chegar à pasta de spam.
      </AccountNotice>
      <p className="mt-6 text-sm leading-6 text-zinc-600">
        Depois da confirmação, você poderá entrar e acompanhar o status do seu cadastro.
        Solicitações de jogador, candidato e parceiro ainda passam pela análise do clube.
      </p>
      <p className="mt-6 text-sm">
        <AccountTextLink href="/entrar">Voltar para entrar</AccountTextLink>
      </p>
    </AccountShell>
  );
}

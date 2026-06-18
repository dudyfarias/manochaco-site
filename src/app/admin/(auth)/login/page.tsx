import type { Metadata } from "next";
import Link from "next/link";
import { loginAdmin } from "@/lib/admin/actions";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Login administrativo",
  description: "Acesso administrativo protegido do Clube Atlético Manochaco.",
};

function getErrorMessage(error?: string) {
  if (error === "missing-env") {
    return "Supabase ainda não está configurado neste ambiente.";
  }

  if (error === "invalid") {
    return "E-mail ou senha inválidos.";
  }

  if (error) {
    return "Não foi possível acessar o painel.";
  }

  return "";
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const next = typeof params.next === "string" ? params.next : "/admin";
  const loggedOut = params.loggedOut === "1";
  const message = getErrorMessage(error);

  return (
    <div className="bg-[#f4f1e8] px-4 py-20">
      <div className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-xs font-black uppercase text-[#9a6a12]">
          Manochaco Admin
        </p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">
          Entrar no painel
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Acesso exclusivo para administradores cadastrados no Supabase Auth.
        </p>

        {message ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {message}
          </div>
        ) : null}

        {loggedOut ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            Sessão encerrada com sucesso.
          </div>
        ) : null}

        <form action={loginAdmin} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-xs font-black uppercase text-zinc-500">
              E-mail
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#d1a137]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-zinc-500">
              Senha
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#d1a137]"
            />
          </label>
          <button className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f0c35d]">
            Entrar
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 inline-flex text-sm font-bold text-[#8a5b0b] hover:text-black"
        >
          Voltar ao site público
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePublicSessionState } from "./PublicSessionProvider";

const headerLinkClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-black transition";

export function PublicAccountLinks({ variant }: { variant: "header" | "footer" }) {
  const sessionState = usePublicSessionState();

  if (variant === "header") {
    return (
      <div className="order-2 flex min-h-10 min-w-24 items-center justify-end gap-2 lg:order-none" aria-live="polite">
        {sessionState === "authenticated" ? (
          <Link
            href="/conta"
            className={`${headerLinkClass} border-[#d1a137] bg-[#d1a137] text-black hover:bg-[#f0c35d]`}
          >
            Meu perfil
          </Link>
        ) : sessionState === "guest" ? (
          <>
            <Link
              href="/entrar"
              className={`${headerLinkClass} border-white/20 text-white hover:border-[#d1a137] hover:text-[#f0c35d]`}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className={`${headerLinkClass} border-[#d1a137] bg-[#d1a137] text-black hover:bg-[#f0c35d]`}
            >
              Cadastre-se
            </Link>
          </>
        ) : (
          <span className="h-10 w-24 rounded-md border border-white/10" aria-label="Verificando sessão" />
        )}
      </div>
    );
  }

  if (sessionState === "authenticated") {
    return (
      <Link
        href="/conta"
        className="rounded-md border border-[#d1a137] px-3 py-2 text-sm font-semibold text-[#f0c35d] hover:bg-white/5"
      >
        Meu perfil
      </Link>
    );
  }

  if (sessionState === "loading") {
    return <span className="h-10 w-24 rounded-md border border-white/10" aria-label="Verificando sessão" />;
  }

  return (
    <>
      <Link
        href="/entrar"
        className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#d1a137] hover:text-[#f0c35d]"
      >
        Entrar
      </Link>
      <Link
        href="/cadastro"
        className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#d1a137] hover:text-[#f0c35d]"
      >
        Cadastre-se
      </Link>
    </>
  );
}

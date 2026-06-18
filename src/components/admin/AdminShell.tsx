import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminContext } from "@/lib/auth";
import { logoutAdmin } from "@/lib/admin/actions";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jogadores", label: "Jogadores" },
  { href: "/admin/jogos", label: "Jogos" },
  { href: "/admin/campeonatos", label: "Campeonatos" },
  { href: "/admin/temporadas", label: "Temporadas" },
  { href: "/admin/galeria/albuns", label: "Álbuns" },
  { href: "/admin/galeria/fotos", label: "Fotos" },
  { href: "/admin/fotos/revisao", label: "Revisão IA" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export function AdminShell({
  context,
  children,
}: {
  context: AdminContext;
  children: ReactNode;
}) {
  const displayName =
    context.profile.name ??
    context.profile.fullName ??
    context.user.email ??
    "Administrador";

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#f4f1e8] text-zinc-950">
      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="p-5">
            <Link href="/admin" className="block">
              <p className="text-xs font-black uppercase text-[#d1a137]">
                Manochaco Admin
              </p>
              <h1 className="mt-2 text-2xl font-black">Painel do clube</h1>
            </Link>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-bold">{displayName}</p>
              <p className="mt-1 text-xs text-zinc-400">{context.profile.role}</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-zinc-200 transition hover:bg-white/10 hover:text-[#f0c35d]"
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAdmin} className="shrink-0">
              <button className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-zinc-200 transition hover:bg-white/10 hover:text-[#f0c35d]">
                Sair
              </button>
            </form>
          </nav>
        </aside>
        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </section>
      </div>
    </div>
  );
}

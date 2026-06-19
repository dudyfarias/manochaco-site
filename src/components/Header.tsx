import Link from "next/link";
import { SmartImage } from "./SmartImage";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/historia", label: "História" },
  { href: "/jogadores", label: "Jogadores" },
  { href: "/jogos", label: "Jogos" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/galeria", label: "Galeria" },
  { href: "/patrocinio", label: "Patrocínio" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:gap-x-3 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <SmartImage
            src="/logos/manochaco-logo.png"
            alt="Escudo do Clube Atlético Manochaco"
            width={72}
            height={57}
            sizes="64px"
            fallbackLabel="M"
            priority
            className="h-auto w-12 shrink-0 object-contain sm:w-16"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase text-[#d1a137] sm:text-sm">
              Manochaco
            </p>
            <p className="hidden text-xs text-zinc-400 sm:block">Preto e dourado desde 2014</p>
          </div>
        </Link>
        <nav
          className="order-3 col-span-2 flex gap-1 overflow-x-auto pb-1 lg:order-none lg:col-span-1 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0"
          aria-label="Menu principal"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-zinc-200 transition hover:bg-white/10 hover:text-[#f0c35d]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="order-2 flex items-center gap-2 lg:order-none">
          <Link
            href="/entrar"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 px-3 py-2 text-sm font-black text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-3 py-2 text-sm font-black text-black transition hover:bg-[#f0c35d]"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </header>
  );
}

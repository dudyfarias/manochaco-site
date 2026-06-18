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
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <SmartImage
            src="/logos/manochaco-logo.png"
            alt="Escudo do Clube Atlético Manochaco"
            width={58}
            height={46}
            fallbackLabel="M"
            priority
          />
          <div>
            <p className="text-sm font-black uppercase text-[#d1a137]">
              Manochaco
            </p>
            <p className="text-xs text-zinc-400">Preto e dourado desde 2014</p>
          </div>
        </Link>
        <nav
          className="flex gap-1 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0"
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
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/historia", label: "História" },
  { href: "/elenco", label: "Elenco" },
  { href: "/jogos", label: "Jogos" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/galeria", label: "Galeria" },
  { href: "/patrocinio", label: "Patrocínio" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/manochaco-crest.png"
            alt="Escudo do Clube Atlético Manochaco"
            width={64}
            height={51}
            priority
          />
          <div>
            <p className="text-sm font-semibold text-[#d1a137]">CA Manochaco</p>
            <p className="text-xs text-zinc-400">Preto e dourado desde 2014</p>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-1 lg:justify-end" aria-label="Menu principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-[#f0c35d]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

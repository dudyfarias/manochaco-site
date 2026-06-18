import Link from "next/link";
import { SmartImage } from "./SmartImage";

const footerLinks = [
  { href: "/titulos", label: "Títulos" },
  { href: "/comissao-tecnica", label: "Comissão" },
  { href: "/contato", label: "Contato" },
  { href: "/patrocinio", label: "Patrocínio" },
  { href: "/galeria", label: "Galeria" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="flex gap-4">
          <SmartImage
            src="/logos/manochaco-logo.png"
            alt="Escudo do Manochaco"
            width={82}
            height={65}
            fallbackLabel="M"
          />
          <div>
            <p className="text-lg font-black uppercase">
              Clube Atlético Manochaco
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Portal oficial para história, jogadores, estatísticas, jogos, fotos
              e bastidores. Dados estáticos hoje, estrutura pronta para o painel
              administrativo amanhã.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#d1a137] hover:text-[#f0c35d]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

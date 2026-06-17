import { ButtonLink } from "./ButtonLink";
import { SmartImage } from "./SmartImage";

export function HeroSection() {
  return (
    <section className="relative min-h-[720px] overflow-hidden bg-black text-white">
      <SmartImage
        src="/team/hero-home.jpg"
        alt="Foto real do elenco do Clube Atlético Manochaco"
        fallbackLabel="Manochaco"
        fallbackText="Foto do time em breve"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-72"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <SmartImage
            src="/logos/manochaco-logo.png"
            alt="Escudo do Manochaco"
            width={210}
            height={166}
            fallbackLabel="Manochaco"
            priority
            className="mb-10"
          />
          <p className="mb-4 text-xs font-black uppercase text-[#f0c35d]">
            Clube Atlético Manochaco
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
            Preto e dourado desde 2014.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
            História, estatísticas, fotos e bastidores do Clube Atlético
            Manochaco.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/elenco">Ver elenco</ButtonLink>
            <ButtonLink href="/estatisticas" variant="ghost">
              Ver estatísticas
            </ButtonLink>
            <ButtonLink href="/galeria" variant="ghost">
              Ver galeria
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

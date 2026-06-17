import Image from "next/image";
import { ButtonLink } from "./ButtonLink";

export function HeroSection() {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-black text-white">
      <Image
        src="/team/hero-team.png"
        alt="Placeholder visual do time do Clube Atlético Manochaco"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Image
            src="/logos/manochaco-crest.png"
            alt="Escudo do Manochaco"
            width={180}
            height={143}
            priority
            className="mb-8"
          />
          <p className="mb-4 text-base font-semibold uppercase text-[#f0c35d]">
            Clube Atlético Manochaco
          </p>
          <h1 className="text-5xl font-black leading-none sm:text-6xl lg:text-7xl">
            Preto e dourado desde 2014.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
            História, estatísticas, fotos e bastidores do Clube Atlético
            Manochaco.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/elenco">Ver elenco</ButtonLink>
            <ButtonLink href="/historia" variant="ghost">
              Conhecer história
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

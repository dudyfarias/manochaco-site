import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import { staffMembers } from "@/data";

export const metadata: Metadata = {
  title: "Comissão técnica",
  description:
    "Comissão técnica atual e histórico de técnicos do Clube Atlético Manochaco.",
};

const currentStaff = staffMembers.filter((member) => member.status === "current");
const formerStaff = staffMembers.filter((member) => member.status === "former");

export default function ComissaoTecnicaPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:px-8">
          <div>
            <SectionTitle
              eyebrow="Comissão técnica"
              title="Quem organiza o Manochaco fora de campo"
              description="Registro da comissão atual e dos técnicos que já passaram pelo clube, preparado para crescer junto com o portal."
              tone="dark"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/jogadores">Ver jogadores</ButtonLink>
              <ButtonLink href="/jogos" variant="ghost">
                Ver jogos
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              dark
              label="Atual"
              value={currentStaff.length}
              detail="técnico cadastrado"
            />
            <StatCard
              dark
              label="Histórico"
              value={formerStaff.length}
              detail="passagem registrada"
            />
            <StatCard
              dark
              label="Ciclos"
              value={staffMembers.length}
              detail="registros técnicos"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Atual"
          title="Comissão atual"
          description="A estrutura começa pelo técnico atual e está pronta para receber auxiliares, preparadores e responsáveis de operação."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {currentStaff.map((member) => (
            <article
              key={member.id}
              className="grid overflow-hidden rounded-lg bg-black text-white lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative min-h-80 bg-zinc-950">
                <SmartImage
                  src={member.image}
                  alt={`Imagem de ${member.name}`}
                  fallbackLabel={member.name}
                  fallbackText="Foto da comissão em breve"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover opacity-75"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-black uppercase text-[#d1a137]">
                  {member.role} · {member.period}
                </p>
                <h2 className="mt-4 text-4xl font-black">{member.name}</h2>
                <p className="mt-4 text-base leading-7 text-zinc-300">
                  {member.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {member.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-zinc-200"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                {member.playerSlug ? (
                  <div className="mt-8">
                    <ButtonLink
                      href={`/jogadores/${member.playerSlug}`}
                      variant="ghost"
                    >
                      Ver perfil de jogador
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Histórico"
            title="Técnicos que já passaram pelo clube"
            description="Um acervo para registrar ciclos técnicos, campanhas, conquistas e contribuições para a identidade do Manochaco."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {formerStaff.map((member) => (
              <article
                key={member.id}
                className="rounded-lg border border-zinc-200 bg-[#f7f5ef] p-6"
              >
                <p className="text-xs font-black uppercase text-[#9a6a12]">
                  {member.period}
                </p>
                <h2 className="mt-4 text-3xl font-black text-zinc-950">
                  {member.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-zinc-600">
                  {member.role}
                </p>
                <p className="mt-4 text-sm leading-6 text-zinc-600">
                  {member.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {member.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-md bg-white px-3 py-1 text-xs font-bold text-zinc-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                {member.playerSlug ? (
                  <div className="mt-8">
                    <ButtonLink
                      href={`/jogadores/${member.playerSlug}`}
                      variant="dark"
                    >
                      Ver perfil de jogador
                    </ButtonLink>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

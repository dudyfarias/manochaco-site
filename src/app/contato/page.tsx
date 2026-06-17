import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Canais de contato do Clube Atlético Manochaco para jogos, patrocínio e informações.",
};

const contacts = [
  {
    title: "Patrocínio",
    value: "patrocinio@manochaco.com.br",
    text: "Contato institucional mockado para propostas comerciais.",
  },
  {
    title: "Jogos e amistosos",
    value: "jogos@manochaco.com.br",
    text: "Canal mockado para convites, agenda e partidas amistosas.",
  },
  {
    title: "Galeria e imagem",
    value: "imagem@manochaco.com.br",
    text: "Canal mockado para solicitações sobre fotos, autorização e remoção.",
  },
];

export default function ContatoPage() {
  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Contato"
            title="Fale com o Manochaco"
            description="Canais preparados para agenda, patrocínio, fotos e relacionamento institucional."
            tone="dark"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {contacts.map((contact) => (
          <article
            key={contact.title}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-black text-zinc-950">{contact.title}</h2>
            <p className="mt-3 break-words text-base font-bold text-[#9a6a12]">
              {contact.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{contact.text}</p>
          </article>
        ))}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-black">Pronto para conversar?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Nesta fase estática, o formulário real ainda não foi implementado.
                O fluxo futuro pode usar Supabase, autenticação e painel
                administrativo para receber mensagens.
              </p>
            </div>
            <ButtonLink href="/patrocinio">Ver patrocínio</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

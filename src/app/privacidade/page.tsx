import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Privacidade e uso de dados no portal do Clube Atlético Manochaco.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-[#f4f1e8] px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 sm:p-10">
        <p className="text-xs font-black uppercase text-[#9a6a12]">LGPD</p>
        <h1 className="mt-3 text-4xl font-black text-zinc-950">Privacidade e contas</h1>
        <div className="mt-7 space-y-5 text-sm leading-7 text-zinc-600">
          <p>
            Os dados informados no cadastro são usados para criar e proteger a conta,
            manter contato com o usuário e analisar solicitações de vínculo com o clube.
          </p>
          <p>
            Nome, e-mail, telefone, cidade, ano de nascimento, posição e mensagem não são
            exibidos automaticamente no site público. O acesso administrativo possui
            permissões separadas e não pode ser solicitado pelo cadastro público.
          </p>
          <p>
            Imagens e referências biométricas seguem um fluxo próprio de consentimento,
            armazenamento privado e revisão humana. O cadastro comum não autoriza
            reconhecimento facial.
          </p>
          <p>
            Para corrigir ou solicitar a remoção de dados, use a página de contato do
            Manochaco. A documentação técnica completa está mantida no projeto em LGPD.md.
          </p>
        </div>
      </article>
    </section>
  );
}

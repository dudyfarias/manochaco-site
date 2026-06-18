import type { Metadata } from "next";
import { AdminCard, AdminPageTitle } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin - Financeiro",
};

export default async function AdminFinancePage() {
  await requireAdmin(["super_admin", "finance_admin"]);

  return (
    <div>
      <AdminPageTitle
        eyebrow="Financeiro"
        title="Módulo financeiro"
        description="Área privada para mensalidades, receitas, despesas, patrocínios e caixa do clube."
      />
      <AdminCard className="mt-6">
        <h2 className="text-2xl font-black">Próxima fase</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Este módulo será implementado na Fase 9. As tabelas privadas e RLS já
          estão preparadas, mas nenhum dado financeiro aparece no site público.
        </p>
      </AdminCard>
    </div>
  );
}

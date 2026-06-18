import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireAdmin();

  return <AdminShell context={context}>{children}</AdminShell>;
}

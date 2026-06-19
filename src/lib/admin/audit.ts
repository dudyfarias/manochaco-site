import type { AdminContext } from "@/lib/auth";
import { getAdminSupabase } from "./data";

export async function logAudit(
  context: AdminContext,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>,
) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: context.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("[audit] Falha ao registrar ação administrativa", {
      action,
      entityType,
      entityId,
      error: error.message,
    });
  }
}

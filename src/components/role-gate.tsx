import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { hasMinRole, useAuth } from "@/hooks/use-auth";
import type { AppRole } from "@/lib/db-types";
import { ROLE_LABEL } from "@/lib/format";
import { EmptyState } from "./data-state";

/** Controle de UI apenas. A segurança real é garantida pelas políticas RLS no banco. */
export function RoleGate({ min, children }: { min: AppRole; children: ReactNode }) {
  const { configured, role } = useAuth();
  if (configured && !hasMinRole(role, min)) {
    return (
      <EmptyState
        icon={<Lock className="size-4" />}
        title="Acesso restrito"
        description={`Esta área exige o papel ${ROLE_LABEL[min]} ou superior.`}
        className="py-24"
      />
    );
  }
  return <>{children}</>;
}

export function useCan(min: AppRole): boolean {
  const { configured, role } = useAuth();
  return configured && hasMinRole(role, min);
}
import { Component, type ErrorInfo, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, DatabaseZap, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DbNotConnectedError } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <div className="mb-3 grid size-9 place-items-center rounded-[7px] bg-card text-muted-foreground shadow-raised">
        {icon ?? <Inbox className="size-4" />}
      </div>
      <p className="text-[13px] font-medium tracking-[-0.01em]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NotConnectedState({ className }: { className?: string | undefined }) {
  return (
    <EmptyState
      className={className}
      icon={<DatabaseZap className="size-4" />}
      title="Banco ainda não conectado."
      description="Os dados aparecerão aqui assim que o Supabase existente for conectado a este projeto."
    />
  );
}

export function ErrorState({ onRetry, className }: { onRetry?: () => void; className?: string | undefined }) {
  return (
    <EmptyState
      className={className}
      icon={<AlertTriangle className="size-4 text-destructive" />}
      title="Não foi possível carregar esta informação."
      description="O restante do painel continua funcionando. O erro técnico foi registrado."
      action={
        onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCw className="size-3.5" /> Tentar novamente
          </Button>
        )
      }
    />
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

/** Renderiza loading / erro / vazio / sucesso de uma query sem jamais propagar a falha. */
export function QueryState<T>({
  query,
  children,
  isEmpty,
  empty,
  loading,
  enabled = true,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  loading?: ReactNode;
  enabled?: boolean;
}) {
  if (!enabled) return <NotConnectedState />;
  if (query.error instanceof DbNotConnectedError) return <NotConnectedState />;
  if (query.isLoading) return <>{loading ?? <LoadingRows />}</>;
  if (query.isError) {
    console.error("[query]", query.error);
    return <ErrorState onRetry={() => void query.refetch()} />;
  }
  if (query.data === undefined) return <>{loading ?? <LoadingRows />}</>;
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="Nenhum registro encontrado." />}</>;
  return <>{children(query.data)}</>;
}

type BoundaryState = { error: Error | null };

/** Error boundary por seção: uma falha de renderização não derruba a página. */
export class SectionBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  override state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[section]", error, info.componentStack);
  }
  override render() {
    if (this.state.error) return <ErrorState onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
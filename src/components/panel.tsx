import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionBoundary } from "./data-state";

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-xs", className)}>
      {(title || actions) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>
        <SectionBoundary>{children}</SectionBoundary>
      </div>
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] space-y-4 p-4 md:p-6">{children}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <span className={cn("inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}
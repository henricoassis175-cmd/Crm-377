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
    <section className={cn("overflow-hidden rounded-[10px] bg-card shadow-ring-xs", className)}>
      {(title || actions) && (
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-medium tracking-[-0.01em]">{title}</h2>}
            {description && <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>
        <SectionBoundary>{children}</SectionBoundary>
      </div>
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="page-enter mx-auto w-full max-w-[1440px] space-y-4 p-4 md:p-5 xl:p-6">
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[5px] px-1.5 text-[10.5px] font-medium whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

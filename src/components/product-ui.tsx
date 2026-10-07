import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-[30px] leading-[1.02] tracking-[-0.03em] text-foreground md:text-[36px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <section
      className="grid overflow-hidden rounded-[10px] bg-card shadow-ring-xs sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Indicadores principais"
    >
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "danger" | "success";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-[118px] border-b border-border/70 p-4 sm:border-r xl:border-b-0",
        "transition-colors duration-150 hover:bg-muted/35",
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
        <div>
          <div
            className={cn(
              "font-mono text-[25px] font-medium tabular-nums tracking-[-0.04em]",
              tone === "danger" && "text-destructive",
              tone === "success" && "text-success",
            )}
          >
            {value}
          </div>
          {hint && <p className="mt-1 text-[10.5px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export function DataTableFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[10px] bg-card shadow-ring-xs", className)}>
      {children}
    </div>
  );
}

export const tableHeadClass =
  "border-b border-border/70 bg-muted/35 text-left text-[9.5px] font-medium uppercase tracking-[0.075em] text-muted-foreground";
export const tableRowClass =
  "border-b border-border/60 transition-colors duration-150 hover:bg-muted/35 last:border-b-0";
export const tableCellClass = "h-10 px-4 align-middle text-[12px]";

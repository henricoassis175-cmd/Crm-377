import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Period = "today" | "week" | "month";
const periods = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "7 dias" },
  { value: "month", label: "30 dias" },
] as const;

export function PeriodControl({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  return (
    <div
      className={cn("segmented-control", `segmented-${value}`)}
      role="group"
      aria-label="Período dos indicadores"
    >
      {periods.map((period) => (
        <Button
          key={period.value}
          variant="ghost"
          size="sm"
          aria-pressed={value === period.value}
          className={cn(value === period.value && "selected")}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
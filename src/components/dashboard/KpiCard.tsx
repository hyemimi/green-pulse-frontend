import { memo } from "react";
import { Sparkline } from "./Sparkline";

type KpiCardProps = {
  label: string;
  subLabel?: string;
  value: string;
  valueClassName?: string;
  trend?: string;
  badge?: string;
  spark?: "up" | "down";
};

function KpiCardComponent({ label, subLabel, value, valueClassName = "text-white", trend, badge, spark }: KpiCardProps) {
  return (
    <section className="kpi-card flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex min-w-0 items-center justify-between gap-3 text-[13px] font-semibold text-process-muted">
        <p className="min-w-0 truncate">{label}</p>
        {subLabel ? <p className="min-w-0 shrink truncate text-right text-[11px] font-medium">{subLabel}</p> : <p className="shrink-0 text-[11px] text-process-orange">{trend}</p>}
      </div>
      <div className="flex min-w-0 items-center justify-between gap-4">
        <p className={`min-w-0 truncate text-[28px] font-bold leading-none ${valueClassName}`}>{value}</p>
        {spark ? <Sparkline variant={spark} /> : null}
        {badge ? <span className="shrink-0 rounded bg-current/10 px-2 py-1 text-[11px] font-semibold text-inherit">{badge}</span> : null}
      </div>
    </section>
  );
}

export const KpiCard = memo(KpiCardComponent);

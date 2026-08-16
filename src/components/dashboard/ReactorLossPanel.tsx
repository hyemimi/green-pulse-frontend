import { memo, useMemo } from "react";
import { severityStyle } from "../../constants/dashboardData";
import type { ReactorLoss } from "../../types/dashboard";

type ReactorLossPanelProps = {
  reactors: ReactorLoss[];
};

function ReactorLossPanelComponent({ reactors }: ReactorLossPanelProps) {
  const maxLoss = useMemo(() => Math.max(...reactors.map((reactor) => reactor.loss), 0), [reactors]);

  return (
    <section className="panel flex h-full w-[420px] shrink-0 flex-col gap-4 overflow-hidden p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-bold">반응기별 예상 전력 손실 (Expected Power Loss by Reactor)</p>
        <p className="shrink-0 truncate text-[11px] text-process-muted">CSV 손실량 기준 정렬</p>
      </div>
      <div className="flex min-w-0 flex-col gap-2.5 overflow-hidden">
        {reactors.map((reactor) => {
          const style = severityStyle[reactor.status];
          const width = maxLoss === 0 ? 0 : (reactor.loss / maxLoss) * 100;

          return (
            <div key={reactor.id} className="flex min-w-0 items-center justify-between gap-3 rounded-[10px] border border-process-line bg-process-bg px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`shrink-0 rounded-full border px-2 py-[3px] text-[11px] font-bold ${style.border} ${style.bg} ${style.text} ${
                    reactor.status === "caution" ? "bg-process-yellow text-process-bg" : ""
                  }`}
                >
                  {style.badgeText}
                </span>
                <p className="min-w-0 truncate text-[13px] font-bold">{reactor.label}</p>
              </div>
              <div className="flex min-w-[168px] shrink-0 items-center gap-3">
                <p className={`w-[72px] whitespace-nowrap text-right text-[13px] font-bold ${style.text}`}>{reactor.loss.toFixed(2)} kWh</p>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded border border-process-line bg-process-bg">
                  <div className={`h-full rounded ${style.fill}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const ReactorLossPanel = memo(ReactorLossPanelComponent);

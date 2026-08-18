import { memo, useMemo } from "react";
import { severityStyle } from "../../constants/dashboardData";
import type { ReactorLoss } from "../../types/dashboard";

type ReactorLossPanelProps = {
  reactors: ReactorLoss[];
  playbackMinute: number;
  maxPlaybackMinute: number;
};

function ReactorLossPanelComponent({
  reactors,
  playbackMinute,
  maxPlaybackMinute,
}: ReactorLossPanelProps) {
  const maxLoss = useMemo(
    () => Math.max(...reactors.map((reactor) => reactor.unmitigatedLossKwh), 0),
    [reactors],
  );

  return (
    <section className="panel flex h-full w-[420px] shrink-0 flex-col gap-4 overflow-hidden p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-bold">
          반응기별 전력 손실 (Power Loss by Reactor)
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-2.5 overflow-hidden">
        {reactors.map((reactor) => {
          const style = severityStyle[reactor.status];
          const unmitigatedWidth =
            maxLoss === 0 ? 0 : (reactor.unmitigatedLossKwh / maxLoss) * 100;
          const avoidableWidth =
            maxLoss === 0 ? 0 : (reactor.avoidableLossKwh / maxLoss) * 100;

          return (
            <div
              key={reactor.id}
              className="flex min-w-0 items-center justify-between gap-3 rounded-[10px] border border-process-line bg-process-bg px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`shrink-0 rounded-full border px-2 py-[3px] text-[11px] font-bold ${style.border} ${style.bg} ${style.text} ${
                    reactor.status === "caution"
                      ? "bg-process-yellow text-process-bg"
                      : ""
                  }`}
                >
                  {style.badgeText}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">
                    {reactor.label}
                  </p>
                  <p className="text-[10px] text-process-muted">
                    탐지 {reactor.episodeCount}건 · 예방률{" "}
                    {reactor.savingRatePct.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex min-w-[182px] shrink-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="w-[88px] whitespace-nowrap text-right text-[11px] font-bold text-process-red">
                    방치 {reactor.unmitigatedLossKwh.toFixed(2)}
                  </p>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-process-line">
                    <div
                      className="h-full rounded bg-process-red"
                      style={{ width: `${unmitigatedWidth}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="w-[88px] whitespace-nowrap text-right text-[11px] font-bold text-process-cyan">
                    예방 {reactor.avoidableLossKwh.toFixed(2)}
                  </p>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-process-line">
                    <div
                      className="h-full rounded bg-process-cyan"
                      style={{ width: `${avoidableWidth}%` }}
                    />
                  </div>
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

import { memo, useEffect, useState } from "react";
import { SegmentedNavigation } from "../common/SegmentedNavigation";
import { formatClock, randomFebruary2024Date } from "../../utils/date";

function DashboardHeaderComponent() {
  const [simulationTime, setSimulationTime] = useState(randomFebruary2024Date);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSimulationTime((current) => new Date(current.getTime() + 1_000));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-process-cyan" />
          <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[1px] text-process-muted">Intelligent Process Control Lab</p>
        </div>
        <h1 className="whitespace-nowrap text-2xl font-extrabold">AI 기반 화학공정 에너지·이상 모니터링</h1>
      </div>
      <div className="flex items-center gap-4">
        <SegmentedNavigation active="process" tone="cyan" />
        <span className="rounded border border-process-green bg-process-green/10 px-2.5 py-1.5 text-xs font-semibold text-process-green">SYSTEM ONLINE</span>
        <p className="whitespace-nowrap text-sm text-process-muted">{formatClock(simulationTime)}</p>
      </div>
    </header>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);

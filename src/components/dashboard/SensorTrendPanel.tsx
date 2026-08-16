import { memo } from "react";
import { REACTOR_IDS } from "../../constants/dashboardData";
import type { DashboardSummary, SensorTrendResponse } from "../../types/dashboard";
import { SensorTrendChart } from "./SensorTrendChart";
import { StatusChip } from "./StatusChip";

type SensorTrendPanelProps = {
  summary: DashboardSummary;
  dataUpdatedAt: number;
  trend?: SensorTrendResponse;
};

const SENSOR_LABELS = [
  { label: "온도", tone: "cyan" as const },
  { label: "압력", tone: "orange" as const },
  { label: "유량", tone: "green" as const },
  { label: "진동", tone: "yellow" as const },
  { label: "전류", tone: "red" as const },
];

function SensorTrendPanelComponent({ summary, dataUpdatedAt, trend }: SensorTrendPanelProps) {
  return (
    <section className="panel flex min-w-0 flex-1 flex-col gap-5 overflow-hidden p-6">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-base font-bold">실시간 센서 트렌드 (Real-time Sensor Trends)</p>
          <p className="truncate text-xs text-process-muted">{trend?.reactorId ?? "A_R2"} 고장 전후 온도·압력·유량·진동·전류 추이 모니터링</p>
        </div>
        <p className="shrink-0 text-[11px] text-process-muted">score {(summary.averageScore * 100).toFixed(0)}% · {new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-process-line bg-process-bg px-2.5 py-2">
          <p className="shrink-0 text-xs font-semibold text-process-muted">반응기</p>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {REACTOR_IDS.map((id) => (
              <StatusChip key={id} active={id === (trend?.reactorId ?? "A_R2")}>
                {id}
              </StatusChip>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-process-line bg-process-bg px-2.5 py-2">
          <p className="shrink-0 text-xs font-semibold text-process-muted">센서</p>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {SENSOR_LABELS.map((sensor) => (
              <StatusChip key={sensor.label} active tone={sensor.tone}>
                {sensor.label}
              </StatusChip>
            ))}
          </div>
        </div>
      </div>
      <SensorTrendChart trend={trend} />
    </section>
  );
}

export const SensorTrendPanel = memo(SensorTrendPanelComponent);

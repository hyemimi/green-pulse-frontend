import { memo } from "react";
import { alertOctagon, alertTriangle, checkCircle, severityStyle } from "../../constants/dashboardData";
import { useDetections } from "../../hooks/useDetections";
import type { Detection } from "../../api/detections";
import type { AlertItem, Severity } from "../../types/dashboard";

function severityFor(score: number): Severity {
  if (score >= 0.9) return "critical";
  if (score >= 0.7) return "warning";
  return "caution";
}

function iconFor(severity: Severity) {
  if (severity === "critical") return alertOctagon;
  if (severity === "warning") return alertTriangle;
  return checkCircle;
}

function toAlertItem(detection: Detection): AlertItem {
  const severity = severityFor(detection.score);
  const time = new Date(detection.detected_at).toISOString().slice(11, 16);

  return {
    severity,
    icon: iconFor(severity),
    title: `Reactor ${detection.reactor_id} | ${detection.fault_type} 감지 | ${detection.specialist}`,
    meta: `${time} | score ${Math.round(detection.score * 100)}%`,
  };
}

function AlertsPanelComponent() {
  const { data: detections = [] } = useDetections();

  const alertItems = [...detections]
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())
    .map(toAlertItem);

  return (
    <section className="panel flex h-full w-[380px] shrink-0 flex-col gap-4 overflow-hidden p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-bold">실시간 이상 알림 (Active Anomaly Alerts)</p>
        <span className="shrink-0 rounded bg-process-red px-1.5 py-0.5 text-[11px] font-bold text-black">LIVE</span>
      </div>
      <div className="flex min-w-0 flex-col gap-3 overflow-hidden">
        {alertItems.map((alert) => {
          const style = severityStyle[alert.severity];

          return (
            <article key={alert.title} className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 ${style.border} ${style.bg}`}>
              <img alt="" className="h-[18px] w-[18px] shrink-0" src={alert.icon} />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-bold">{alert.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-process-muted">{alert.meta}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const AlertsPanel = memo(AlertsPanelComponent);
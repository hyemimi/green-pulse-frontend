import { useMemo } from "react";
import type { Detection } from "../api/detections";
import type { DashboardSummary } from "../types/dashboard";

export function useDashboardSummary(detections: Detection[]): DashboardSummary {
  return useMemo(() => {
    const riskyReactors = new Set(detections.map((item) => item.reactor_id.split("_")[0])).size;
    const averageScore = detections.length === 0 ? 0 : detections.reduce((sum, item) => sum + item.score, 0) / detections.length;

    return {
      riskyReactors,
      activeAnomalies: Math.max(12, detections.length * 3),
      averageScore,
    };
  }, [detections]);
}

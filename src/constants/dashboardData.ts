import type { AlertItem, Severity } from "../types/dashboard";

export const alertOctagon = "https://www.figma.com/api/mcp/asset/46ecd0f3-f60e-4653-9a24-7d742ccca95e.svg";
export const alertTriangle = "https://www.figma.com/api/mcp/asset/8c8cae9d-8fa9-48fb-b6f0-17af976e296b.svg";
export const checkCircle = "https://www.figma.com/api/mcp/asset/c9e0d973-0a90-4900-b68f-331aeb5b06f2.svg";

export const REACTOR_IDS = ["A_R1", "A_R2", "A_R3", "B_R1", "B_R2", "B_R3"] as const;
export const INACTIVE_SENSOR_LABELS = ["유량", "진동", "전류"] as const;

export const alerts: AlertItem[] = [
  {
    severity: "critical",
    icon: alertOctagon,
    title: "Reactor A_R2 | F1 감지 | thermal_after_hold",
    meta: "19:08 | score 100%",
  },
  {
    severity: "warning",
    icon: alertTriangle,
    title: "Reactor A_R2 | 온도/압력 추이 | fault onset 이후 손실 발생",
    meta: "19:06 | CSV sensor trend",
  },
  {
    severity: "warning",
    icon: checkCircle,
    title: "Reactor A_R1 | 누적 손실 상위 | 평균 손실률 0.733%",
    meta: "원본 CSV 집계",
  },
  {
    severity: "caution",
    icon: checkCircle,
    title: "Reactor B_R1 | 누적 손실 상위 | 평균 손실률 0.673%",
    meta: "원본 CSV 집계",
  },
  {
    severity: "caution",
    icon: checkCircle,
    title: "Reactor B_R3 | 누적 손실 상위 | 평균 손실률 0.654%",
    meta: "원본 CSV 집계",
  },
  {
    severity: "normal",
    icon: checkCircle,
    title: "CSV 기반 mock API 연결 완료",
    meta: "sensor-trends / reactor-power-loss",
  },
];

export const severityStyle: Record<Severity, { text: string; border: string; bg: string; fill: string; badgeText: string }> = {
  critical: {
    text: "text-process-red",
    border: "border-process-red",
    bg: "bg-process-red/10",
    fill: "bg-process-red",
    badgeText: "CRITICAL",
  },
  warning: {
    text: "text-process-orange",
    border: "border-process-orange",
    bg: "bg-process-orange/10",
    fill: "bg-process-orange",
    badgeText: "WARNING",
  },
  caution: {
    text: "text-process-yellow",
    border: "border-process-yellow",
    bg: "bg-process-yellow/10",
    fill: "bg-process-yellow",
    badgeText: "CAUTION",
  },
  normal: {
    text: "text-process-green",
    border: "border-process-green",
    bg: "bg-process-green/10",
    fill: "bg-process-green",
    badgeText: "NORMAL",
  },
};

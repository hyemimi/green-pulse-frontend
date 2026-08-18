export type Severity = "critical" | "warning" | "caution" | "normal";

export type ReactorLoss = {
  id: string;
  label: string;
  episodeCount: number;
  unmitigatedLossKwh: number;
  actualLossUntilDetectionKwh: number;
  avoidableLossKwh: number;
  savingRatePct: number;
  status: Severity;
};

export type ReactorLossResponse = {
  playbackMinute: number;
  maxPlaybackMinute: number;
  isPlaybackComplete: boolean;
  totalUnmitigatedLossKwh: number;
  totalAvoidableLossKwh: number;
  reactors: ReactorLoss[];
};

export type SensorPoint = {
  timestamp: string;
  time: string;
  reactorTemp: number | null;
  reactorPressure: number | null;
  feedFlowRate: number | null;
  vibrationRms: number | null;
  motorCurrent: number | null;
  powerConsumptionKw: number | null;
  tempSetpoint: number | null;
  pressureSetpoint: number | null;
  faultType: string;
  efficiencyLossPct: number | null;
};

export type SensorTrendResponse = {
  reactorId: string;
  from: string;
  to: string;
  faultOnset: string | null;
  detectedAt: string | null;
  anomalyDurationMin?: number;
  axisLabels: string[];
  points: SensorPoint[];
};

export type AlertItem = {
  severity: Severity;
  icon: string;
  title: string;
  meta: string;
};

export type DashboardSummary = {
  riskyReactors: number;
  activeAnomalies: number;
  averageScore: number;
};

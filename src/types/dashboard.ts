export type Severity = "critical" | "warning" | "caution" | "normal";

export type ReactorLoss = {
  id: string;
  label: string;
  loss: number;
  averagePowerKw: number;
  averageEfficiencyLossPct: number;
  faultCount: number;
  status: Severity;
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
  faultOnset: string;
  detectedAt: string;
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

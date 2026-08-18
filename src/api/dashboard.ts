import type { ReactorLoss, ReactorLossResponse, SensorTrendResponse } from "../types/dashboard";
import {
  DEMO_DATE,
  DEMO_EPISODE_ID,
  DEMO_REACTOR_ID,
  DEMO_SENSOR_FROM_ISO,
  DEMO_SENSOR_TO_ISO,
} from "../constants/demoTimeline";
import { formatTimeInSeoul } from "../utils/date";
import { fetchServerJson } from "./client";

type BackendReactorLoss = Omit<ReactorLoss, "id" | "label" | "status"> & {
  reactorId: string;
};

export function fetchSensorTrends(reactorId: string) {
  if (reactorId === DEMO_REACTOR_ID) {
    return fetchServerJson<SensorTrendResponse>(
      `/api/episodes/${DEMO_EPISODE_ID}/sensor-trend?holdMin=0&bufferMin=15`,
    ).then(normalizeTrendTimes);
  }

  return fetchServerJson<BackendReading[]>(
    `/api/reactors/${reactorId}/readings?from=${DEMO_SENSOR_FROM_ISO}&to=${DEMO_SENSOR_TO_ISO}&limit=100`,
  ).then((rows): SensorTrendResponse => ({
    reactorId,
    from: DEMO_SENSOR_FROM_ISO,
    to: DEMO_SENSOR_TO_ISO,
    faultOnset: null,
    detectedAt: null,
    axisLabels: rows.map((row) => formatTimeInSeoul(row.timestamp)),
    points: rows.map((row) => ({
      timestamp: row.timestamp,
      time: formatTimeInSeoul(row.timestamp),
      reactorTemp: row.reactorTemp,
      reactorPressure: row.reactorPressure,
      feedFlowRate: row.feedFlowRate,
      vibrationRms: row.vibrationRms,
      motorCurrent: row.motorCurrent,
      powerConsumptionKw: row.powerConsumptionKw,
      tempSetpoint: row.tempSetpoint,
      pressureSetpoint: row.pressureSetpoint,
      faultType: row.faultType === 0 ? "Normal" : `F${row.faultType}`,
      efficiencyLossPct: row.efficiencyLossPct,
    })),
  }));
}

type BackendReading = {
  timestamp: string;
  reactorTemp: number | null;
  reactorPressure: number | null;
  feedFlowRate: number | null;
  vibrationRms: number | null;
  motorCurrent: number | null;
  powerConsumptionKw: number | null;
  tempSetpoint: number | null;
  pressureSetpoint: number | null;
  faultType: number;
  efficiencyLossPct: number | null;
};

function normalizeTrendTimes(trend: SensorTrendResponse): SensorTrendResponse {
  return {
    ...trend,
    axisLabels: trend.points.map((point) => formatTimeInSeoul(point.timestamp)),
    points: trend.points.map((point) => ({
      ...point,
      time: formatTimeInSeoul(point.timestamp),
    })),
  };
}

type BackendReactorLossResponse = Omit<ReactorLossResponse, "reactors"> & {
  reactors: BackendReactorLoss[];
};

export function fetchReactorPowerLoss(playbackMinute: number) {
  return fetchServerJson<BackendReactorLossResponse>(
    `/api/esg/reactor-losses?holdMin=0&from=${DEMO_DATE}&to=${DEMO_DATE}&playbackMinute=${playbackMinute}`,
  ).then((rows) => {
    const maxLoss = Math.max(...rows.reactors.map((row) => row.unmitigatedLossKwh), 0);

    const reactors = rows.reactors.map((row) => ({
        ...row,
        id: row.reactorId,
        label: `Reactor ${row.reactorId}`,
        status: lossSeverity(row.unmitigatedLossKwh, maxLoss),
      }))
      .sort((left, right) => right.unmitigatedLossKwh - left.unmitigatedLossKwh);

    return { ...rows, reactors };
  });
}

function lossSeverity(lossKwh: number, maxLossKwh: number): ReactorLoss["status"] {
  if (lossKwh <= 0 || maxLossKwh <= 0) return "normal";

  const ratio = lossKwh / maxLossKwh;
  if (ratio >= 0.75) return "critical";
  if (ratio >= 0.5) return "warning";
  return "caution";
}

export function fetchEpisodeSensorTrend(episodeId: number) {
  return fetchServerJson<SensorTrendResponse>(`/api/episodes/${episodeId}/sensor-trend`);
}

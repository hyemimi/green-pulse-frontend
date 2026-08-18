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
      `/api/episodes/${DEMO_EPISODE_ID}/sensor-trend?holdMin=0&bufferMin=30`,
    ).then(normalizeTrendTimes);
  }

  return fetchServerJson<BackendReading[]>(
    `/api/reactors/${reactorId}/readings?from=${DEMO_SENSOR_FROM_ISO}&to=${DEMO_SENSOR_TO_ISO}&limit=100`,
  ).then((rows): SensorTrendResponse => normalizeTrendTimes({
      reactorId,
      from: DEMO_SENSOR_FROM_ISO,
      to: DEMO_SENSOR_TO_ISO,
      faultOnset: null,
      detectedAt: null,
      axisLabels: [],
      points: rows.map((row) => ({
        timestamp: row.timestamp,
        time: "",
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
  if (trend.points.length === 0) {
    return trend;
  }

  const now = Date.now();
  const anomalyDurationMin = trend.faultOnset && trend.detectedAt
    ? Math.max(
        (new Date(trend.detectedAt).getTime() - new Date(trend.faultOnset).getTime()) / 60_000,
        1,
      )
    : 0;
  const windowSize = Math.min(61, trend.points.length);
  const endIndex = Math.floor(now / 60_000) % trend.points.length;
  const sourcePoints = Array.from({ length: windowSize }, (_, index) => {
    const sourceIndex = (endIndex - windowSize + 1 + index + trend.points.length) % trend.points.length;
    return trend.points[sourceIndex];
  });
  const points = sourcePoints.map((point, index) => {
    const timestamp = new Date(now - (windowSize - index - 1) * 60_000).toISOString();
    return {
      ...point,
      timestamp,
      time: formatTimeInSeoul(timestamp),
    };
  });
  const faultOnsetTime = trend.faultOnset ? new Date(trend.faultOnset).getTime() : Number.NaN;
  const detectedAtTime = trend.detectedAt ? new Date(trend.detectedAt).getTime() : Number.NaN;
  const anomalyIndexes = sourcePoints
    .map((point, index) => ({ index, time: new Date(point.timestamp).getTime() }))
    .filter(({ time }) => (
      Number.isFinite(faultOnsetTime)
      && Number.isFinite(detectedAtTime)
      && time >= faultOnsetTime
      && time <= detectedAtTime
    ))
    .map(({ index }) => index);
  const faultOnsetIndex = anomalyIndexes[0] ?? -1;
  const detectedAtIndex = anomalyIndexes[anomalyIndexes.length - 1] ?? -1;

  return {
    ...trend,
    from: points[0].timestamp,
    to: points[points.length - 1].timestamp,
    faultOnset: faultOnsetIndex >= 0 ? points[faultOnsetIndex].timestamp : null,
    detectedAt: detectedAtIndex >= 0 ? points[detectedAtIndex].timestamp : null,
    anomalyDurationMin,
    axisLabels: points.map((point) => point.time),
    points,
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
  return fetchServerJson<SensorTrendResponse>(
    `/api/episodes/${episodeId}/sensor-trend?holdMin=0&bufferMin=30`,
  ).then(normalizeTrendTimes);
}

import type { ReactorLoss, ReactorLossResponse, SensorTrendResponse } from "../types/dashboard";
import { fetchServerJson } from "./client";

type BackendReactorLoss = Omit<ReactorLoss, "id" | "label" | "status"> & {
  reactorId: string;
};

export function fetchSensorTrends(reactorId: string) {
  return fetchServerJson<SensorTrendResponse>(
    `/api/reactors/${reactorId}/sensor-trend`,
  );
}

type BackendReactorLossResponse = Omit<ReactorLossResponse, "reactors"> & {
  reactors: BackendReactorLoss[];
};

export function fetchReactorPowerLoss(playbackMinute: number) {
  return fetchServerJson<BackendReactorLossResponse>(
    `/api/esg/reactor-losses?holdMin=0&playbackMinute=${playbackMinute}`,
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

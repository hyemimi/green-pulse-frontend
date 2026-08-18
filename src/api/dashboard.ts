import type { ReactorLoss, SensorTrendResponse } from "../types/dashboard";
import { fetchServerJson } from "./client";

export function fetchSensorTrends(reactorId: string) {
  return fetchServerJson<SensorTrendResponse>(
    `/api/reactors/${reactorId}/sensor-trend`,
  );
}

export function fetchReactorPowerLoss() {
  return fetch("/mock/reactor-power-loss.json").then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch reactor power loss mock data");
    }

    return response.json() as Promise<ReactorLoss[]>;
  });
}
// 이거는 아직 멀었음

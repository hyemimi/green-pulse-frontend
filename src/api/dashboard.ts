import type { ReactorLoss, SensorTrendResponse } from "../types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json() as Promise<T>;
}

export function fetchSensorTrends() {
  return fetchJson<SensorTrendResponse>("http://localhost:3000/api/episodes/17/sensor-trend");
}

export function fetchReactorPowerLoss() {
  return fetchJson<ReactorLoss[]>("/mock/reactor-power-loss.json");
}
// 이거는 아직 멀었음 
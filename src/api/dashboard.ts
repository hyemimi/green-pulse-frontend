import type { ReactorLoss, SensorTrendResponse } from "../types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json() as Promise<T>;
}

export function fetchSensorTrends() {
  return fetchJson<SensorTrendResponse>("/mock/sensor-trends.json");
}

export function fetchReactorPowerLoss() {
  return fetchJson<ReactorLoss[]>("/mock/reactor-power-loss.json");
}

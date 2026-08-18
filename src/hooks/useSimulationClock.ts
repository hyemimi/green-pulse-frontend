import { useEffect, useState } from "react";
import { randomFebruary2024Date } from "../utils/date";

const STORAGE_KEY = "green-pulse-simulation-clock";

type SimulationClockAnchor = {
  simulationStartedAt: number;
  realStartedAt: number;
};

export function useSimulationClock() {
  const [simulationTime, setSimulationTime] = useState(currentSimulationTime);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSimulationTime(currentSimulationTime());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  return simulationTime;
}

function currentSimulationTime() {
  const anchor = getOrCreateAnchor();
  const elapsed = Date.now() - anchor.realStartedAt;

  return new Date(anchor.simulationStartedAt + elapsed);
}

function getOrCreateAnchor(): SimulationClockAnchor {
  const saved = window.sessionStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as SimulationClockAnchor;
      if (Number.isFinite(parsed.simulationStartedAt) && Number.isFinite(parsed.realStartedAt)) {
        return parsed;
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const anchor = {
    simulationStartedAt: randomFebruary2024Date().getTime(),
    realStartedAt: Date.now(),
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(anchor));
  return anchor;
}

import { useEffect, useState } from "react";

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
  const now = new Date();
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    timeParts.find((part) => part.type === type)?.value ?? "00";

  return new Date(`2024-03-29T${value("hour")}:${value("minute")}:${value("second")}+09:00`);
}

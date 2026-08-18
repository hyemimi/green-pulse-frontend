import { useState } from "react";
import { AlertsPanel } from "./components/dashboard/AlertsPanel";
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { KpiRow } from "./components/dashboard/KpiRow";
import { ReactorLossPanel } from "./components/dashboard/ReactorLossPanel";
import { SensorTrendPanel } from "./components/dashboard/SensorTrendPanel";
import { EsgPerformancePage } from "./components/esg/EsgPerformancePage";
import { useDashboardSummary } from "./hooks/useDashboardSummary";
import { useDetections } from "./hooks/useDetections";
import { useReactorPowerLoss } from "./hooks/useReactorPowerLoss";
import { useSensorTrends } from "./hooks/useSensorTrends";

function ProcessDashboardPage() {
  const [selectedReactorId, setSelectedReactorId] = useState("A_R2");
  const { data: detections = [], dataUpdatedAt } = useDetections();
  const { data: sensorTrend } = useSensorTrends(selectedReactorId);
  const { data: reactorLosses = [] } = useReactorPowerLoss();
  const summary = useDashboardSummary(detections);

  return (
    <main className="min-h-screen min-w-[1180px] overflow-x-auto bg-process-bg p-8">
      <div className="flex min-h-[calc(100vh-64px)] min-w-0 flex-col gap-4">
        <DashboardHeader />
        <KpiRow summary={summary} reactorLosses={reactorLosses} />
        <section className="grid flex-1 grid-cols-[minmax(560px,1fr)_420px_380px] gap-4 overflow-hidden">
          <SensorTrendPanel
  summary={summary}
  dataUpdatedAt={dataUpdatedAt}
  trend={sensorTrend}
  selectedReactorId={selectedReactorId}
  onSelectReactor={setSelectedReactorId}
/>
          <ReactorLossPanel reactors={reactorLosses} />
          <AlertsPanel />
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const path = window.location.pathname;

  if (path === "/esg" || path === "/esg-performance") {
    return <EsgPerformancePage />;
  }

  return <ProcessDashboardPage />;
}

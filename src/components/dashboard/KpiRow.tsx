import { memo, useMemo } from "react";
import type { DashboardSummary, ReactorLoss } from "../../types/dashboard";
import { KpiCard } from "./KpiCard";

type KpiRowProps = {
  summary: DashboardSummary;
  reactorLosses: ReactorLoss[];
};

function KpiRowComponent({ summary, reactorLosses }: KpiRowProps) {
  const powerLoss = useMemo(() => {
    const maxLoss = Math.max(...reactorLosses.map((reactor) => reactor.loss), 0);
    const avoidableLoss = reactorLosses.reduce((sum, reactor) => sum + reactor.loss, 0);

    return {
      maxLoss,
      avoidableLoss,
    };
  }, [reactorLosses]);

  return (
    <section className="grid grid-cols-4 gap-4">
      <KpiCard label="이상 반응기 (Reactors at Risk)" value={`${summary.riskyReactors} / 6`} trend={`${summary.riskyReactors} / 6`} spark="up" />
      <KpiCard label="활성 이상 알림 (Active Anomalies)" value={`${summary.activeAnomalies}건`} trend={`${summary.activeAnomalies}건`} spark="down" />
      <KpiCard
        label="방치 시 예상 전력 손실 (Expected Power Loss)"
        subLabel="CSV 평균 손실 전력 기준"
        value={`${powerLoss.maxLoss.toFixed(2)} kWh`}
        valueClassName="text-process-red"
        badge="위험"
      />
      <KpiCard
        label="예방 가능 전력 손실 (Avoidable Power Loss)"
        subLabel="전체 반응기 합산"
        value={`${powerLoss.avoidableLoss.toFixed(2)} kWh`}
        valueClassName="text-process-cyan"
        badge="회피 가능"
      />
    </section>
  );
}

export const KpiRow = memo(KpiRowComponent);

import { memo, useMemo } from "react";
import type { DashboardSummary, ReactorLoss } from "../../types/dashboard";
import { KpiCard } from "./KpiCard";

type KpiRowProps = {
  summary: DashboardSummary;
  reactorLosses: ReactorLoss[];
  playbackMinute: number;
  maxPlaybackMinute: number;
};

function KpiRowComponent({ summary, reactorLosses, playbackMinute, maxPlaybackMinute }: KpiRowProps) {
  const powerLoss = useMemo(() => {
    const unmitigatedLoss = reactorLosses.reduce(
      (sum, reactor) => sum + reactor.unmitigatedLossKwh,
      0,
    );
    const avoidableLoss = reactorLosses.reduce(
      (sum, reactor) => sum + reactor.avoidableLossKwh,
      0,
    );

    return {
      unmitigatedLoss,
      avoidableLoss,
    };
  }, [reactorLosses]);

  return (
    <section className="grid grid-cols-4 gap-4">
      <KpiCard label="이상 반응기 (Reactors at Risk)" value={`${summary.riskyReactors} / 6`} trend={`${summary.riskyReactors} / 6`} spark="up" />
      <KpiCard label="활성 이상 알림 (Active Anomalies)" value={`${summary.activeAnomalies}건`} trend={`${summary.activeAnomalies}건`} spark="down" />
      <KpiCard
        label="방치 시 예상 전력 손실 (Expected Power Loss)"
        subLabel="전체 고장 에피소드 기준"
        value={`${powerLoss.unmitigatedLoss.toFixed(2)} kWh`}
        valueClassName="text-process-red"
        badge="위험"
      />
      <KpiCard
        label="예방 가능 전력 손실 (Avoidable Power Loss)"
        subLabel={`공정 재생 ${playbackMinute}/${maxPlaybackMinute}분`}
        value={`${powerLoss.avoidableLoss.toFixed(2)} kWh`}
        valueClassName="text-process-cyan"
        badge="회피 가능"
      />
    </section>
  );
}

export const KpiRow = memo(KpiRowComponent);

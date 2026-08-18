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
    // 사용자 요청: '방치 시 예상 전력 손실'이 시간이 지남에 따라 증가하도록
    // 'actualLossUntilDetectionKwh'(누적된 실제 손실량)을 사용합니다.
    const occurredLoss = reactorLosses.reduce(
      (sum, reactor) => sum + reactor.actualLossUntilDetectionKwh,
      0,
    );
    const avoidableLoss = reactorLosses.reduce(
      (sum, reactor) => sum + reactor.avoidableLossKwh,
      0,
    );

    return {
      occurredLoss,
      avoidableLoss,
    };
  }, [reactorLosses]);

  return (
    <section className="grid grid-cols-4 gap-4">
      <KpiCard label="이상 반응기 (Reactors at Risk)" value={`${summary.riskyReactors} / 6`} trend={`${summary.riskyReactors} / 6`} spark="up" />
      <KpiCard label="활성 이상 알림 (Active Anomalies)" value={`${summary.activeAnomalies}건`} trend={`${summary.activeAnomalies}건`} spark="down" />
      <KpiCard
        label="누적 전력 손실 (Accumulated Power Loss)"
        subLabel="고장 발생 후 현재까지 누적된 손실"
        value={`${powerLoss.occurredLoss.toFixed(2)} kWh`}
        valueClassName="text-process-red"
      />
      <KpiCard
        label="예방 가능 전력 손실 (Avoidable Power Loss)"
        subLabel={`공정 재생 ${playbackMinute}/${maxPlaybackMinute}분`}
        value={`${powerLoss.avoidableLoss.toFixed(2)} kWh`}
        valueClassName="text-process-cyan"
        badge="절감 가능"
      />
    </section>
  );
}

export const KpiRow = memo(KpiRowComponent);

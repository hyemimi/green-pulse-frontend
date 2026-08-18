import { memo, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { SensorPoint, SensorTrendResponse } from "../../types/dashboard";
import { buildLinePath, buildPoints } from "../../utils/chart";

type SensorTrendChartProps = {
  trend?: SensorTrendResponse;
  dataUpdatedAt: number;
};

type SensorSeriesConfig = {
  key: string;
  label: string;
  unit: string;
  color: string;
  selector: (point: SensorPoint) => number | null;
};

const CHART_WIDTH = 440;
const CHART_HEIGHT = 380;
const PLOT_HEIGHT = 286;
const PLOT_OFFSET_Y = 48;
const X_TICK_INTERVAL_MINUTES = 10;
const LANE_GAP = 8;

const SENSOR_SERIES: SensorSeriesConfig[] = [
  { key: "temp", label: "온도", unit: "°C", color: "#00f0ff", selector: (point) => point.reactorTemp },
  { key: "pressure", label: "압력", unit: "bar", color: "#f97316", selector: (point) => point.reactorPressure },
  { key: "flow", label: "유량", unit: "L/min", color: "#10b981", selector: (point) => point.feedFlowRate },
  { key: "vibration", label: "진동", unit: "RMS", color: "#fbbf24", selector: (point) => point.vibrationRms },
  { key: "current", label: "전류", unit: "A", color: "#ef4444", selector: (point) => point.motorCurrent },
];

const LANE_HEIGHT = (PLOT_HEIGHT - (SENSOR_SERIES.length - 1) * LANE_GAP) / SENSOR_SERIES.length;

function fillMissingValues(points: SensorPoint[], selector: (point: SensorPoint) => number | null) {
  return points.map((point, index) => {
    const value = selector(point);
    if (value !== null) {
      return value;
    }

    const previous = [...points.slice(0, index)].reverse().map(selector).find((candidate): candidate is number => candidate !== null);
    const next = points.slice(index + 1).map(selector).find((candidate): candidate is number => candidate !== null);

    if (previous !== undefined && next !== undefined) {
      return (previous + next) / 2;
    }

    return previous ?? next ?? 0;
  });
}

function formatSensorValue(value: number | null, unit: string) {
  if (value === null) {
    return "-";
  }

  const precision = Math.abs(value) >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${unit}`;
}

function getTickIndexes(length: number) {
  if (length === 0) {
    return [];
  }

  const last = length - 1;
  const indexes = Array.from(
    { length: Math.floor(last / X_TICK_INTERVAL_MINUTES) + 1 },
    (_, index) => index * X_TICK_INTERVAL_MINUTES,
  );

  if (indexes[indexes.length - 1] !== last) {
    indexes.push(last);
  }

  return indexes;
}

function SensorTrendChartComponent({ trend, dataUpdatedAt }: SensorTrendChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now);
  const anomalyAnimationRef = useRef<{ anchorX: number; startedAt: number } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTimeMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const chart = useMemo(() => {
    const points = trend?.points ?? [];
    const detectedPointIndex = trend?.detectedAt
      ? points.findIndex((point) => point.timestamp === trend.detectedAt)
      : -1;
    const onsetPointIndex = trend?.faultOnset
      ? points.findIndex((point) => point.timestamp === trend.faultOnset)
      : -1;
    const hasAnomaly = onsetPointIndex >= 0 && detectedPointIndex >= 0;
    const fallbackIndex = detectedPointIndex >= 0 ? detectedPointIndex : Math.max(points.length - 1, 0);
    const liveIndex = points.length > 0 && dataUpdatedAt > 0
      ? points.length - 1
      : fallbackIndex;
    const activeIndex = Math.min(selectedIndex ?? liveIndex, Math.max(points.length - 1, 0));
    const onsetIndex = Math.max(onsetPointIndex, 0);
    const detectedIndex = Math.max(detectedPointIndex, onsetIndex + 1);
    const step = points.length > 1 ? CHART_WIDTH / (points.length - 1) : 40;
    const calculatedAnomalyX = Math.max(0, onsetIndex * step - 8);

    if (hasAnomaly && anomalyAnimationRef.current === null) {
      anomalyAnimationRef.current = { anchorX: calculatedAnomalyX, startedAt: currentTimeMs };
    } else if (!hasAnomaly) {
      anomalyAnimationRef.current = null;
    }

    // 사용자 요청: 데모 속도를 30배로 빠르게 조정 (1분에 해당하는 애니메이션이 2초 동안 재생)
    const DEMO_SPEED_MULTIPLIER = 30;
    const elapsedMinutes = anomalyAnimationRef.current
      ? (Math.max(currentTimeMs - anomalyAnimationRef.current.startedAt, 0) / 60_000) * DEMO_SPEED_MULTIPLIER
      : 0;
    const anomalyDurationMin = Math.max(trend?.anomalyDurationMin ?? detectedIndex - onsetIndex, 1);
    const visibleAnomalyMinutes = Math.min(elapsedMinutes, anomalyDurationMin * DEMO_SPEED_MULTIPLIER);

    // 사용자 요청: 주황색 박스의 오른쪽 선분은 차트 끝에 고정하고, 왼쪽으로 면적이 확장되도록 수정합니다.
    const currentWidth = Math.max(step, visibleAnomalyMinutes * step);
    const rightEdgeX = CHART_WIDTH; // 차트의 오른쪽 끝
    const anomalyX = Math.max(calculatedAnomalyX, rightEdgeX - currentWidth);
    const anomalyWidth = rightEdgeX - anomalyX;

    // 센서마다 자기만의 세로 구역(lane)을 갖게 해서, 겹치지 않고 각자 스케일로 그려지게 함
    const series = SENSOR_SERIES.map((sensor, index) => {
      const values = fillMissingValues(points, sensor.selector);
      const laneOffset = PLOT_OFFSET_Y + index * (LANE_HEIGHT + LANE_GAP);

      return {
        ...sensor,
        laneOffset,
        path: buildLinePath(values, CHART_WIDTH, LANE_HEIGHT, { paddingRatio: 0.18 }),
        chartPoints: buildPoints(values, CHART_WIDTH, LANE_HEIGHT, laneOffset, { paddingRatio: 0.18 }),
      };
    });

    return {
      points,
      activeIndex,
      activePoint: points[activeIndex],
      tickIndexes: getTickIndexes(points.length),
      series,
      step,
      hasAnomaly: hasAnomaly && anomalyWidth > 0,
      activeX: activeIndex * step,
      anomalyX,
      anomalyWidth,
    };
  }, [currentTimeMs, dataUpdatedAt, selectedIndex, trend]);

  const handlePointerMove = (event: MouseEvent<SVGRectElement>) => {
    if (chart.points.length <= 1) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const nextIndex = Math.round(x / chart.step);
    setSelectedIndex(Math.max(0, Math.min(chart.points.length - 1, nextIndex)));
  };

  if (!trend || chart.points.length === 0) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center text-xs text-process-muted">
        센서 트렌드 데이터를 불러오는 중
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="mb-3 flex w-full flex-wrap justify-between gap-3 px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-process-muted">
          {chart.series.map((series) => (
            <span key={series.key} className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
          ))}
        </div>
        <div className="min-w-0 rounded-[8px] border border-process-line bg-process-bg px-2.5 py-1.5 text-right text-[11px] text-process-muted">
          <span className="font-bold text-white">{chart.activePoint?.time}</span>
          <span className="ml-2">커서 지점</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[380px] w-full max-w-[440px] overflow-visible">
        {/* 레인 구분선 */}
        {chart.series.slice(0, -1).map((series) => (
          <line
            key={`sep-${series.key}`}
            x1="0"
            x2={CHART_WIDTH}
            y1={series.laneOffset + LANE_HEIGHT + LANE_GAP / 2}
            y2={series.laneOffset + LANE_HEIGHT + LANE_GAP / 2}
            stroke="#2e3148"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
        {chart.hasAnomaly ? <rect x={chart.anomalyX} y={PLOT_OFFSET_Y} width={chart.anomalyWidth} height={PLOT_HEIGHT} rx="6" fill="rgba(249,115,22,0.10)" stroke="#f97316" /> : null}
        {chart.series.map((series) => (
          <text key={`label-${series.key}`} x="4" y={series.laneOffset + 10} fontSize="10" fontWeight="700" fill={series.color}>
            {series.label} ({series.unit})
          </text>
        ))}

        {/* 센서별 선 - 이제 자기 레인 안에서만 그려짐 */}
        {chart.series.map((series) => (
          <path key={series.key} d={series.path} transform={`translate(0 ${series.laneOffset})`} fill="none" stroke={series.color} strokeWidth="2" />
        ))}

        {chart.tickIndexes.map((index) => (
          <g key={chart.points[index].timestamp}>
            <line x1={index * chart.step} x2={index * chart.step} y1={PLOT_OFFSET_Y + PLOT_HEIGHT} y2={PLOT_OFFSET_Y + PLOT_HEIGHT + 6} stroke="#8f96a8" opacity="0.75" />
            <text x={index * chart.step} y={PLOT_OFFSET_Y + PLOT_HEIGHT + 26} textAnchor="middle" fill="#8f96a8" fontSize="11" fontWeight="600">
              {chart.points[index].time}
            </text>
          </g>
        ))}

        {/* 커서 라인 - 5개 레인을 관통해서, 같은 시점의 5개 센서 값을 한번에 비교 가능 */}
        <line x1={chart.activeX} x2={chart.activeX} y1={PLOT_OFFSET_Y} y2={PLOT_OFFSET_Y + PLOT_HEIGHT} stroke="#8f96a8" strokeDasharray="4 6" opacity="0.65" />

        {chart.points.map((point, index) => (
          <g key={point.timestamp}>
            {chart.series.map((series) => (
              <circle
                key={series.key}
                cx={series.chartPoints[index].x}
                cy={series.chartPoints[index].y}
                r={index === chart.activeIndex ? 3.4 : 2}
                fill={series.color}
                opacity={index === chart.activeIndex ? 1 : 0.72}
              />
            ))}
          </g>
        ))}
        {chart.hasAnomaly ? (
          <foreignObject x={Math.min(chart.anomalyX + 16, CHART_WIDTH - 112)} y="14" width="112" height="26">
            <div className="rounded-full border border-process-orange bg-process-orange/10 px-2 py-1 text-center text-[11px] font-bold text-process-orange">
              이상 전조 감지 구간
            </div>
          </foreignObject>
        ) : null}
        <rect
          x="0"
          y={PLOT_OFFSET_Y}
          width={CHART_WIDTH}
          height={PLOT_HEIGHT}
          fill="transparent"
          className="cursor-crosshair"
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setSelectedIndex(null)}
          onClick={handlePointerMove}
        />
      </svg>

      <div className="mt-1 grid w-full grid-cols-5 gap-1.5 px-2 text-[10px] text-process-muted">
        {chart.series.map((series) => (
          <div key={series.key} className="min-w-0 rounded border border-process-line bg-process-bg px-2 py-1">
            <p className="truncate" style={{ color: series.color }}>
              {series.label}
            </p>
            <p className="truncate font-bold text-white">{formatSensorValue(series.selector(chart.activePoint), series.unit)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const SensorTrendChart = memo(SensorTrendChartComponent);

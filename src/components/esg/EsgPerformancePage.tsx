import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { EsgKpi, EsgPerformance, EsgTone, MonthlySaving, QuarterMilestone } from "../../api/esg";
import { useEsgPerformance } from "../../hooks/useEsgPerformance";
import { useSimulationClock } from "../../hooks/useSimulationClock";
import { displayYearMonth, formatYearMonth } from "../../utils/date";
import { SegmentedNavigation } from "../common/SegmentedNavigation";

const leafIcon = "https://www.figma.com/api/mcp/asset/79f16789-ef02-40b0-80b9-0ed803465846.svg";
const calendarIcon = "https://www.figma.com/api/mcp/asset/af3a09d1-c7aa-4753-a610-5479b5415294.svg";
const sparklesIcon = "https://www.figma.com/api/mcp/asset/9db48927-3082-4cdc-ad9c-4c620dee9ed5.svg";
const infoIcon = "https://www.figma.com/api/mcp/asset/f3d310c5-8d67-41d2-8f76-5a1849a4cde3.svg";

const toneClass: Record<EsgTone, { text: string; bg: string; shadow: string }> = {
  cyan: { text: "text-process-cyan", bg: "bg-process-cyan/10", shadow: "shadow-[0_8px_12px_rgba(0,240,255,0.04)]" },
  green: { text: "text-process-green", bg: "bg-process-green/10", shadow: "shadow-[0_8px_12px_rgba(16,185,129,0.04)]" },
  amber: { text: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", shadow: "shadow-[0_8px_12px_rgba(245,158,11,0.04)]" },
};

function scaleY(value: number, max: number, height: number) {
  return height - (value / max) * height;
}

function linePath(values: number[], width: number, height: number, max: number) {
  return values
    .map((value, index) => {
      const x = pointX(index, values.length, width);
      const y = scaleY(value, max, height);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function pointX(index: number, count: number, width: number) {
  return count <= 1 ? width / 2 : (index / (count - 1)) * width;
}

function MonthSelector({
  months,
  selectedMonth,
  onMonthChange,
}: {
  months: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-10 min-w-[146px] items-center justify-between gap-3 rounded-[10px] border border-[#29324a] bg-[#121626] px-3.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:border-process-green/50 hover:bg-[#171c2f] focus:border-process-green/70 focus:outline-none"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-process-green/10">
            <img alt="" className="size-4" src={calendarIcon} />
          </span>
          <span className="text-[14px] font-extrabold tracking-[0.2px]">{displayYearMonth(selectedMonth)}</span>
        </span>
        <svg
          aria-hidden="true"
          className={`size-4 text-[#8f9bb3] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 16 16"
        >
          <path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      </button>

      {isOpen ? (
        <div
          aria-label="ESG 조회 월"
          className="absolute right-0 top-[46px] z-50 w-full overflow-hidden rounded-[10px] border border-[#29324a] bg-[#121626] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          role="listbox"
        >
          {months.map((month) => {
            const isSelected = month === selectedMonth;
            return (
              <button
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-bold transition ${
                  isSelected
                    ? "bg-process-green/15 text-process-green"
                    : "text-[#c4ccdc] hover:bg-[#20273d] hover:text-white"
                }`}
                key={month}
                role="option"
                type="button"
                onClick={() => {
                  onMonthChange(month);
                  setIsOpen(false);
                }}
              >
                <span>{displayYearMonth(month)}</span>
                {isSelected ? <span className="text-[10px] font-extrabold">선택됨</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function EsgHeader({
  data,
  selectedMonth,
  onMonthChange,
}: {
  data: EsgPerformance;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}) {
  const monthOptions = [...new Set([selectedMonth, ...data.availableMonths])].sort();

  return (
    <header className="flex w-full items-center justify-between gap-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="flex size-[22px] items-center justify-center rounded bg-process-green/10 p-1">
            <img alt="" className="size-[14px]" src={leafIcon} />
          </span>
          <p className="whitespace-nowrap text-xs font-extrabold uppercase tracking-[1.5px] text-process-green">ESG Sustainability Corporate Report</p>
        </div>
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="whitespace-nowrap text-[26px] font-extrabold leading-none text-white">ESG 에너지 절감 성과 리포트</h1>
          <p className="truncate text-[15px] font-medium text-[#8f9bb3]">{data.subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <SegmentedNavigation active="esg" tone="green" />
        <MonthSelector months={monthOptions} selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
        <div className="rounded-md border border-process-green bg-process-green/10 px-3 py-1.5 text-xs font-bold text-process-green">{data.status}</div>
      </div>
    </header>
  );
}

const EsgKpiCard = memo(function EsgKpiCard({ kpi }: { kpi: EsgKpi }) {
  const tone = toneClass[kpi.tone];

  return (
    <section className={`flex min-w-0 flex-1 flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-6 ${tone.shadow}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="truncate text-sm font-semibold text-[#8f9bb3]">{kpi.label}</p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full p-2 ${tone.bg}`}>
          <img alt="" className="size-5" src={kpi.icon} />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className={`flex items-baseline gap-1 whitespace-nowrap ${tone.text}`}>
          <p className="text-[32px] font-extrabold leading-none">{kpi.value}</p>
          <p className="text-base font-semibold">{kpi.unit}</p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${tone.bg} ${tone.text}`}>{kpi.badge}</span>
          <p className="min-w-0 truncate text-xs font-medium text-[#626e8a]">{kpi.description}</p>
        </div>
      </div>
    </section>
  );
});

function MonthlySavingsChart({ rows }: { rows: MonthlySaving[] }) {
  const chart = useMemo(() => {
    const width = 710;
    const height = 200;
    const rawMax = Math.max(...rows.flatMap((row) => [row.monthly, row.cumulative]), 1);
    const max = Math.ceil(rawMax / 10) * 10;
    const monthlyPath = linePath(
      rows.map((row) => row.monthly),
      width,
      height,
      max,
    );
    const cumulativePath = linePath(
      rows.map((row) => row.cumulative),
      width,
      height,
      max,
    );
    const areaPath = `${monthlyPath} L ${width} ${height} L 0 ${height} Z`;
    const best = rows.reduce(
      (top, row, index) => (row.monthly > top.row.monthly ? { row, index } : top),
      { row: rows[0], index: 0 },
    );
    const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0];

    return { width, height, max, monthlyPath, cumulativePath, areaPath, best, ticks };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <section className="flex h-[520px] min-w-0 items-center justify-center rounded-card border border-[#20273d] bg-[#121626] p-6">
        <p className="text-sm font-semibold text-[#8f9bb3]">표시할 월별 절감 데이터가 없습니다.</p>
      </section>
    );
  }

  const periodLabel = `${rows[0].month} ~ ${rows[rows.length - 1].month}`;
  const bestX = pointX(chart.best.index, rows.length, chart.width);
  const bestY = scaleY(chart.best.row.monthly, chart.max, chart.height);

  return (
    <section className="flex h-[520px] min-w-0 flex-col gap-5 rounded-card border border-[#20273d] bg-[#121626] p-6">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-base font-bold text-white">월별 에너지 절감 추이 (Monthly Energy Savings)</p>
          <p className="truncate text-[13px] text-[#8f9bb3]">{periodLabel} 월별 및 누적 절감 현황 · 단위 kWh</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-[#8f9bb3]">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-process-green" />월간 절감량</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-[#f59e0b]" />누적 절감량</span>
        </div>
      </div>
      <div className="flex h-[200px] min-w-0 gap-2">
        <div className="flex h-full w-8 shrink-0 flex-col justify-between text-right text-[11px] text-[#626e8a]">
          {chart.ticks.map((tick) => <p key={tick}>{tick.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}</p>)}
        </div>
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[200px] min-w-0 flex-1 overflow-visible">
          {[10, 55, 100, 145, 190].map((y) => <line key={y} x1="0" x2={chart.width} y1={y} y2={y} stroke="#20273d" strokeWidth="1" />)}
          {rows.map((row, index) => {
            const x = pointX(index, rows.length, chart.width);
            const barHeight = (row.monthly / chart.max) * chart.height;
            return <rect key={row.month} x={x - 10} y={chart.height - barHeight} width="20" height={barHeight} rx="4" fill="url(#energyBar)" opacity="0.42" />;
          })}
          <defs>
            <linearGradient id="energyBar" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chart.areaPath} fill="url(#energyArea)" opacity="0.35" />
          <defs>
            <linearGradient id="energyArea" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="1" stopColor="#00f0ff" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={chart.monthlyPath} fill="none" stroke="#10b981" strokeWidth="3" />
          <path d={chart.cumulativePath} fill="none" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="2" />
          <circle cx={bestX} cy={bestY} r="5" fill="#10b981" />
          <foreignObject x={Math.min(Math.max(bestX - 60, 0), chart.width - 130)} y={Math.max(bestY - 34, 0)} width="130" height="28">
            <div className="rounded border border-[#20273d] bg-[#090b1a] px-2 py-1 text-[11px] font-bold text-white">최고: {chart.best.row.monthly.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} kWh</div>
          </foreignObject>
        </svg>
      </div>
      <div className="flex w-full justify-between pl-10 text-[11px] text-[#8f9bb3]">
        {rows.map((row) => <span key={row.month}>{row.month}</span>)}
      </div>
    </section>
  );
}

function EcoImpactCard({ data }: { data: EsgPerformance }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-white">환경 영향 환산 효과 (Eco Impact)</p>
        <img alt="" className="size-4" src={sparklesIcon} />
      </div>
      <div className="flex flex-col gap-2.5">
        {data.ecoImpact.map((item) => (
          <div key={item.highlight} className="flex items-center gap-4 rounded-[10px] bg-[#20273d] p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#121626] text-lg">{item.icon}</div>
            <p className="min-w-0 text-sm font-bold text-white">
              {item.text} <span className="font-extrabold text-process-green">{item.highlight}</span> {item.suffix}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuarterlyMilestones({ quarters, target }: { quarters: QuarterMilestone[]; target: EsgPerformance["target"] }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-5">
      <p className="text-[15px] font-bold text-white">분기별 에너지 절감 현황 (Quarterly Savings)</p>
      <div className="flex flex-col gap-2.5">
        {quarters.map((quarter) => {
          const isAmber = quarter.tone === "amber";
          const color = isAmber ? "#f59e0b" : "#10b981";
          return (
            <div key={quarter.label} className="flex items-center gap-4">
              <p className={`w-9 text-[13px] font-bold ${isAmber ? "text-[#f59e0b]" : "text-[#8f9bb3]"}`}>{quarter.label}</p>
              <div className="h-2 w-40 overflow-hidden rounded bg-[#323a52]">
                <div className="h-full" style={{ width: `${Math.min(quarter.percent, 102)}%`, backgroundColor: color }} />
              </div>
              <span className={`rounded px-2 py-0.5 text-xs font-bold ${isAmber ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "bg-process-green/10 text-process-green"}`}>{quarter.percent}%</span>
              {quarter.note ? <span className="text-[11px] font-semibold text-[#f59e0b]">{quarter.note}</span> : null}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-process-cyan/20 bg-process-cyan/5 p-3">
        <img alt="" className="size-4" src={infoIcon} />
        <p className="min-w-0 text-xs font-semibold text-process-cyan">
          {target.goal > 0
            ? `연간 목표 ${target.goal.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} ${target.unit} · 현재 ${target.actual.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} ${target.unit}`
            : `현재 누적 ${target.actual.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} ${target.unit} · 연간 목표는 아직 설정되지 않았습니다.`}
        </p>
      </div>
    </section>
  );
}

function EsgPageContent({
  data,
  selectedMonth,
  onMonthChange,
}: {
  data: EsgPerformance;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}) {
  return (
    <main className="min-h-screen min-w-[1180px] bg-[#090b1a] p-8 text-white">
      <div className="flex min-h-[calc(100vh-64px)] flex-col gap-5">
        <EsgHeader data={data} selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
        <section className="grid grid-cols-4 gap-4">
          {data.kpis.map((kpi) => <EsgKpiCard key={kpi.id} kpi={kpi} />)}
        </section>
        <section className="grid grid-cols-[minmax(0,1fr)_450px] gap-4">
          <MonthlySavingsChart rows={data.monthlySavings} />
          <div className="flex flex-col gap-4">
            <EcoImpactCard data={data} />
            <QuarterlyMilestones quarters={data.quarters} target={data.target} />
          </div>
        </section>
        <footer className="flex items-center justify-between pt-2">
          <p className="truncate text-xs text-[#626e8a]">© 2025 Intelligent Process Control Lab. All rights reserved. 본 대시보드의 환경 수치는 탄소배출권(KOC) 공인 계산 가이드라인에 의거하여 작성되었습니다.</p>
          <div className="flex shrink-0 gap-2">
            <button className="rounded-md bg-[#20273d] px-3 py-1.5 text-[11px] font-bold text-white">이사회 보고서 출력</button>
            <button className="rounded-md bg-process-green px-3 py-1.5 text-[11px] font-bold text-black">투자자 IR 공유</button>
          </div>
        </footer>
      </div>
    </main>
  );
}

export function EsgPerformancePage() {
  const simulationTime = useSimulationClock();
  const simulationMonth = formatYearMonth(simulationTime);
  const [selectedMonth, setSelectedMonth] = useState(simulationMonth);
  const { data, error, isLoading, refetch } = useEsgPerformance(selectedMonth);

  useEffect(() => {
    setSelectedMonth(simulationMonth);
  }, [simulationMonth]);

  if (isLoading) {
    return <main className="min-h-screen bg-[#090b1a] p-8 text-sm text-[#8f9bb3]">ESG 실데이터를 불러오는 중...</main>;
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#090b1a] p-8 text-white">
        <p className="text-lg font-bold">ESG 데이터를 불러오지 못했습니다.</p>
        <p className="text-sm text-[#8f9bb3]">백엔드 서버 주소와 실행 상태를 확인해 주세요.</p>
        <button className="rounded-md bg-process-green px-4 py-2 text-sm font-bold text-black" onClick={() => void refetch()}>다시 시도</button>
      </main>
    );
  }

  return (
    <EsgPageContent
      data={data}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
    />
  );
}

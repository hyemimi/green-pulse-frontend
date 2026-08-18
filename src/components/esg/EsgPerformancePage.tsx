import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  fetchQuarterTargets,
  saveQuarterTargets,
  type EsgKpi,
  type EsgPerformance,
  type EsgTone,
  type MonthlySaving,
  type QuarterMilestone,
} from "../../api/esg";
import { serverApiUrl } from "../../api/client";
import { useEsgPerformance } from "../../hooks/useEsgPerformance";
import { useSimulationClock } from "../../hooks/useSimulationClock";
import { displayYearMonth, formatYearMonth } from "../../utils/date";
import { SegmentedNavigation } from "../common/SegmentedNavigation";

const leafIcon =
  "https://www.figma.com/api/mcp/asset/79f16789-ef02-40b0-80b9-0ed803465846.svg";
const calendarIcon =
  "https://www.figma.com/api/mcp/asset/af3a09d1-c7aa-4753-a610-5479b5415294.svg";
const sparklesIcon =
  "https://www.figma.com/api/mcp/asset/9db48927-3082-4cdc-ad9c-4c620dee9ed5.svg";

const toneClass: Record<EsgTone, { text: string; bg: string; shadow: string }> =
  {
    cyan: {
      text: "text-process-cyan",
      bg: "bg-process-cyan/10",
      shadow: "shadow-[0_8px_12px_rgba(0,240,255,0.04)]",
    },
    green: {
      text: "text-process-green",
      bg: "bg-process-green/10",
      shadow: "shadow-[0_8px_12px_rgba(16,185,129,0.04)]",
    },
    amber: {
      text: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      shadow: "shadow-[0_8px_12px_rgba(245,158,11,0.04)]",
    },
  };
function downloadEsgReport() {
  const link = document.createElement("a");
  link.href = serverApiUrl("/api/reports/esg.docx");
  link.download = "esg-report.docx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function scaleY(value: number, max: number, height: number) {
  return height - (value / max) * height;
}

function linePath(
  values: number[],
  width: number,
  height: number,
  max: number,
) {
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
          <span className="text-[14px] font-extrabold tracking-[0.2px]">
            {displayYearMonth(selectedMonth)}
          </span>
        </span>
        <svg
          aria-hidden="true"
          className={`size-4 text-[#8f9bb3] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="m3.5 6 4.5 4 4.5-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
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
                {isSelected ? (
                  <span className="text-[10px] font-extrabold">선택됨</span>
                ) : null}
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
  onOpenTargetManager,
}: {
  data: EsgPerformance;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenTargetManager: () => void;
}) {
  const monthOptions = [
    ...new Set([selectedMonth, ...data.availableMonths]),
  ].sort();

  return (
    <header className="flex w-full items-center justify-between gap-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="flex size-[22px] items-center justify-center rounded bg-process-green/10 p-1">
            <img alt="" className="size-[14px]" src={leafIcon} />
          </span>
          <p className="whitespace-nowrap text-xs font-extrabold uppercase tracking-[1.5px] text-process-green">
            ESG Sustainability Corporate Report
          </p>
        </div>
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="whitespace-nowrap text-[26px] font-extrabold leading-none text-white">
            ESG 에너지 절감 성과 리포트
          </h1>
          <p className="truncate text-[15px] font-medium text-[#8f9bb3]">
            {data.subtitle}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <SegmentedNavigation active="esg" tone="green" />
        <button
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#29324a] bg-[#121626] px-3.5 text-[12px] font-bold text-[#c4ccdc] transition hover:border-process-cyan/40 hover:bg-[#171c2f] hover:text-process-cyan"
          type="button"
          onClick={onOpenTargetManager}
        >
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            viewBox="0 0 18 18"
          >
            <circle
              cx="9"
              cy="9"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle
              cx="9"
              cy="9"
              r="3.2"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
          </svg>
          분기 목표 관리
        </button>
        <MonthSelector
          months={monthOptions}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
        <div className="rounded-md border border-process-green bg-process-green/10 px-3 py-1.5 text-xs font-bold text-process-green">
          {data.status}
        </div>
      </div>
    </header>
  );
}

const EsgKpiCard = memo(function EsgKpiCard({ kpi }: { kpi: EsgKpi }) {
  const tone = toneClass[kpi.tone];

  return (
    <section
      className={`flex min-w-0 flex-1 flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-6 ${tone.shadow}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="truncate text-sm font-semibold text-[#8f9bb3]">
          {kpi.label}
        </p>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full p-2 ${tone.bg}`}
        >
          <img alt="" className="size-5" src={kpi.icon} />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className={`flex items-baseline gap-1 whitespace-nowrap ${tone.text}`}
        >
          <p className="text-[32px] font-extrabold leading-none">{kpi.value}</p>
          <p className="text-base font-semibold">{kpi.unit}</p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${tone.bg} ${tone.text}`}
          >
            {kpi.badge}
          </span>
          <p className="min-w-0 truncate text-xs font-medium text-[#626e8a]">
            {kpi.description}
          </p>
        </div>
      </div>
    </section>
  );
});

function MonthlySavingsChart({
  rows,
  title,
  subtitle,
}: {
  rows: MonthlySaving[];
  title: string;
  subtitle: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chart = useMemo(() => {
    const width = 710;
    const height = 330;
    const rawMax = Math.max(
      ...rows.flatMap((row) => [row.monthly, row.cumulative]),
      1,
    );
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
      (top, row, index) =>
        row.monthly > top.row.monthly ? { row, index } : top,
      { row: rows[0], index: 0 },
    );
    const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0];

    return {
      width,
      height,
      max,
      monthlyPath,
      cumulativePath,
      areaPath,
      best,
      ticks,
    };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <section className="flex h-[520px] min-w-0 items-center justify-center rounded-card border border-[#20273d] bg-[#121626] p-6">
        <p className="text-sm font-semibold text-[#8f9bb3]">
          표시할 월별 절감 데이터가 없습니다.
        </p>
      </section>
    );
  }

  const hoveredRow = hoveredIndex === null ? null : rows[hoveredIndex];
  const [bestMonth, bestDay] = chart.best.row.month.split("/");
  const hoveredX =
    hoveredIndex === null ? 0 : pointX(hoveredIndex, rows.length, chart.width);
  const hoveredDailyY = hoveredRow
    ? scaleY(hoveredRow.monthly, chart.max, chart.height)
    : 0;
  const hoveredCumulativeY = hoveredRow
    ? scaleY(hoveredRow.cumulative, chart.max, chart.height)
    : 0;

  const handleChartPointerMove = (event: ReactMouseEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * chart.width;
    const index =
      rows.length <= 1 ? 0 : Math.round((x / chart.width) * (rows.length - 1));
    setHoveredIndex(Math.max(0, Math.min(rows.length - 1, index)));
  };

  return (
    <section className="flex h-full min-h-[520px] min-w-0 flex-col gap-5 rounded-card border border-[#20273d] bg-[#121626] p-6">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-base font-bold text-white">{title}</p>
          <p className="truncate text-[13px] text-[#8f9bb3]">{subtitle}</p>
        </div>
        <div className="flex shrink-0 translate-y-3 flex-col items-end gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold text-[#626e8a]">
              최고 일일 절감량
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold text-[#8f9bb3]">
                {bestMonth}월 {bestDay}일
              </span>
              <strong className="text-[16px] font-extrabold text-white">
                {chart.best.row.monthly.toLocaleString("ko-KR", {
                  maximumFractionDigits: 2,
                })}
              </strong>
              <span className="text-[10px] font-bold text-process-green">
                kWh
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8f9bb3]">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-process-green" />
              일일 절감량
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded bg-[#f59e0b]" />
              누적 절감량
            </span>
          </div>
        </div>
      </div>
      <div className="flex h-[330px] min-w-0 gap-2">
        <div className="flex h-full w-8 shrink-0 flex-col justify-between text-right text-[11px] text-[#626e8a]">
          {chart.ticks.map((tick) => (
            <p key={tick}>
              {tick.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
            </p>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-[330px] min-w-0 flex-1 overflow-visible"
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const y = 10 + (index / 4) * (chart.height - 20);
            return (
              <line
                key={index}
                x1="0"
                x2={chart.width}
                y1={y}
                y2={y}
                stroke="#20273d"
                strokeWidth="1"
              />
            );
          })}
          {rows.map((row, index) => {
            const x = pointX(index, rows.length, chart.width);
            const barHeight = (row.monthly / chart.max) * chart.height;
            return (
              <rect
                key={row.month}
                x={x - 10}
                y={chart.height - barHeight}
                width="20"
                height={barHeight}
                rx="4"
                fill="url(#energyBar)"
                opacity="0.42"
              />
            );
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
          <path
            d={chart.monthlyPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />
          <path
            d={chart.cumulativePath}
            fill="none"
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeWidth="2"
          />
          <rect
            className="cursor-crosshair"
            fill="transparent"
            height={chart.height}
            width={chart.width}
            x="0"
            y="0"
            onMouseLeave={() => setHoveredIndex(null)}
            onMouseMove={handleChartPointerMove}
          />
          {hoveredRow ? (
            <g pointerEvents="none">
              <line
                x1={hoveredX}
                x2={hoveredX}
                y1="0"
                y2={chart.height}
                stroke="#8f9bb3"
                strokeDasharray="4 4"
                opacity="0.65"
              />
              <circle
                cx={hoveredX}
                cy={hoveredDailyY}
                r="5"
                fill="#10b981"
                stroke="#121626"
                strokeWidth="2"
              />
              <circle
                cx={hoveredX}
                cy={hoveredCumulativeY}
                r="4"
                fill="#f59e0b"
                stroke="#121626"
                strokeWidth="2"
              />
              <foreignObject
                height="72"
                width="174"
                x={Math.min(Math.max(hoveredX - 87, 0), chart.width - 174)}
                y={Math.min(
                  Math.max(Math.min(hoveredDailyY, hoveredCumulativeY) - 78, 0),
                  chart.height - 72,
                )}
              >
                <div className="rounded-lg border border-[#34405c] bg-[#090b1a]/95 px-3 py-2 text-[10px] shadow-[0_12px_28px_rgba(0,0,0,0.42)]">
                  <p className="mb-1 font-extrabold text-white">
                    {hoveredRow.month}
                  </p>
                  <p className="flex justify-between gap-3 text-process-green">
                    <span>일일 절감량</span>
                    <strong>
                      {hoveredRow.monthly.toLocaleString("ko-KR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      kWh
                    </strong>
                  </p>
                  <p className="mt-0.5 flex justify-between gap-3 text-[#f59e0b]">
                    <span>누적 절감량</span>
                    <strong>
                      {hoveredRow.cumulative.toLocaleString("ko-KR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      kWh
                    </strong>
                  </p>
                </div>
              </foreignObject>
            </g>
          ) : null}
        </svg>
      </div>
      <div className="flex w-full justify-between pl-10 text-[11px] text-[#8f9bb3]">
        {rows
          .filter(
            (_, index) =>
              index === 0 || index === rows.length - 1 || (index + 1) % 5 === 0,
          )
          .map((row) => (
            <span key={row.month}>{row.month}</span>
          ))}
      </div>
    </section>
  );
}

function EcoImpactCard({ data }: { data: EsgPerformance }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-white">
          환경 영향 환산 효과 (Eco Impact)
        </p>
        <img alt="" className="size-4" src={sparklesIcon} />
      </div>
      <div className="flex flex-col gap-2.5">
        {data.ecoImpact.map((item) => (
          <div
            key={item.highlight}
            className="flex items-center gap-4 rounded-[10px] bg-[#20273d] p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#121626] text-lg">
              {item.icon}
            </div>
            <p className="min-w-0 text-sm font-bold text-white">
              {item.text}{" "}
              <span className="font-extrabold text-process-green">
                {item.highlight}
              </span>{" "}
              {item.suffix}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const DEFAULT_QUARTER_TARGETS = { Q1: "", Q2: "", Q3: "", Q4: "" };

function QuarterTargetManager({
  targets,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  targets: Record<string, string>;
  onClose: () => void;
  onSave: (targets: Record<string, string>) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
}) {
  const [drafts, setDrafts] = useState({ ...targets });
  const quarterPeriods: Record<string, string> = {
    Q1: "1~3월",
    Q2: "4~6월",
    Q3: "7~9월",
    Q4: "10~12월",
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050711]/75 p-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="quarter-target-title"
        aria-modal="true"
        className="w-full max-w-[560px] rounded-2xl border border-[#29324a] bg-[#121626] shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#20273d] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-process-cyan/10 text-process-cyan">
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                viewBox="0 0 18 18"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="3.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
              </svg>
            </span>
            <div>
              <h2
                className="text-[17px] font-extrabold text-white"
                id="quarter-target-title"
              >
                분기 에너지 절감 목표 관리
              </h2>
              <p className="mt-1 text-[11px] font-medium text-[#8f9bb3]">
                분기별 목표 전력량을 입력하면 달성률이 자동으로 계산됩니다.
              </p>
            </div>
          </div>
          <button
            aria-label="닫기"
            className="flex size-8 items-center justify-center rounded-lg text-[#8f9bb3] transition hover:bg-[#20273d] hover:text-white"
            type="button"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </header>
        <div className="grid grid-cols-2 gap-3 p-6">
          {Object.keys(DEFAULT_QUARTER_TARGETS).map((quarter) => (
            <label
              className="rounded-xl border border-[#20273d] bg-[#0d1020] p-4 transition focus-within:border-process-cyan/50"
              key={quarter}
            >
              <span className="mb-3 flex items-center justify-between">
                <strong className="text-[14px] text-white">{quarter}</strong>
                <span className="text-[10px] font-semibold text-[#626e8a]">
                  {quarterPeriods[quarter]}
                </span>
              </span>
              <span className="flex h-11 items-center rounded-lg border border-[#29324a] bg-[#090b1a] px-3 focus-within:border-process-cyan/60">
                <input
                  className="min-w-0 flex-1 bg-transparent text-[17px] font-extrabold text-white outline-none placeholder:text-[#454d67]"
                  inputMode="decimal"
                  placeholder="목표값 입력"
                  type="text"
                  value={drafts[quarter] ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (/^\d*\.?\d*$/.test(value))
                      setDrafts((current) => ({
                        ...current,
                        [quarter]: value,
                      }));
                  }}
                />
                <span className="text-[11px] font-bold text-[#8f9bb3]">
                  kWh
                </span>
              </span>
            </label>
          ))}
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-[#20273d] px-6 py-4">
          <p className="text-[11px] font-semibold text-[#ef6a75]">
            {saveError}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="h-10 rounded-lg border border-[#29324a] px-4 text-[12px] font-bold text-[#8f9bb3] transition hover:bg-[#20273d] hover:text-white disabled:opacity-50"
              disabled={isSaving}
              type="button"
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="h-10 rounded-lg bg-process-cyan px-5 text-[12px] font-extrabold text-[#090b1a] transition hover:bg-[#6ff6ff] disabled:cursor-wait disabled:opacity-60"
              disabled={isSaving}
              type="button"
              onClick={() => void onSave(drafts)}
            >
              {isSaving ? "저장 중..." : "목표 저장"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function QuarterlyMilestones({
  quarters,
  selectedMonth,
  selectedMonthSavingKwh,
  quarterTargets,
}: {
  quarters: QuarterMilestone[];
  selectedMonth: string;
  selectedMonthSavingKwh: number;
  quarterTargets: Record<string, string>;
}) {
  const selectedMonthNumber = Number(selectedMonth.slice(5, 7));
  const selectedQuarterIndex = Math.floor((selectedMonthNumber - 1) / 3);
  const selectedQuarterLabel = `Q${selectedQuarterIndex + 1}`;
  const selectedQuarterTarget = Number(quarterTargets[selectedQuarterLabel]);
  const hasSelectedQuarterTarget =
    Number.isFinite(selectedQuarterTarget) && selectedQuarterTarget > 0;
  const selectedQuarter = quarters[selectedQuarterIndex];

  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-[#20273d] bg-[#121626] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-white">
            분기 에너지 절감 목표 달성 현황
          </p>
          <p className="mt-1 text-[10px] font-semibold text-[#626e8a]">
            분기의 첫 달에 설정한 목표 대비 누적 절감 달성률
          </p>
        </div>
        <span
          className={`mr-6 shrink-0 rounded-lg border px-3 py-2 text-[11px] font-bold ${hasSelectedQuarterTarget ? "border-process-cyan/25 bg-process-cyan/5 text-process-cyan" : "border-[#29324a] bg-[#0d1020] text-[#626e8a]"}`}
        >
          {hasSelectedQuarterTarget
            ? `${selectedQuarterLabel} 목표 ${selectedQuarterTarget.toLocaleString("ko-KR")} kWh`
            : "목표 미설정"}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {(selectedQuarter ? [selectedQuarter] : []).map((quarter) => {
          const targetKwh = Number(quarterTargets[quarter.label]);
          const hasTarget = Number.isFinite(targetKwh) && targetKwh > 0;
          const rawPercent = hasTarget
            ? Math.round((quarter.totalKwh / targetKwh) * 100)
            : 0;
          const percent = Math.min(rawPercent, 100);
          const isAchieved = hasTarget && rawPercent >= 100;
          const color = isAchieved ? "#10b981" : "#f59e0b";
          return (
            <div
              key={quarter.label}
              className="flex min-h-[64px] items-center rounded-lg border border-[#20273d] bg-[#0d1020] px-4 py-3"
            >
              <div className="flex w-full items-center gap-4">
                <p
                  className={`w-[88px] shrink-0 whitespace-nowrap text-[12px] font-bold ${isAchieved ? "text-process-green" : "text-[#f59e0b]"}`}
                >
                  {quarter.label}{" "}
                  <span className="font-semibold text-[#626e8a]">
                    ({quarter.period})
                  </span>
                </p>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-[#323a52]">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span
                  className={`w-11 rounded px-1.5 py-0.5 text-center text-[10px] font-bold ${isAchieved ? "bg-process-green/10 text-process-green" : "bg-[#f59e0b]/15 text-[#f59e0b]"}`}
                >
                  {percent}%
                </span>
                <p
                  className={`w-[104px] shrink-0 text-right text-[11px] font-bold ${quarter.totalKwh > 0 ? "text-[#f59e0b]" : "text-[#8f9bb3]"}`}
                >
                  누적 {quarter.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center rounded-lg border border-process-cyan/20 bg-process-cyan/5 p-3">
        <div className="flex min-w-0 items-center justify-center gap-6 text-center text-xs font-semibold">
          <p className="whitespace-nowrap text-process-cyan">
            {displayYearMonth(selectedMonth)} 절감량 ={" "}
            <strong className="ml-1 text-white">
              {selectedMonthSavingKwh.toLocaleString("ko-KR", {
                maximumFractionDigits: 2,
              })}{" "}
              kWh
            </strong>
          </p>
          <span className="h-4 w-px bg-process-cyan/20" />
          <div className="relative flex items-center whitespace-nowrap text-process-cyan">
            <span>{selectedQuarterLabel} 누적</span>
            <span
              aria-label={`${selectedQuarterLabel} 누적 계산식: ${selectedQuarter?.breakdown ?? "0 kWh"}`}
              className="group relative ml-1 mr-1.5 inline-flex size-3.5 cursor-pointer items-center justify-center rounded-full border border-process-cyan/50 text-[9px] font-extrabold leading-none text-process-cyan outline-none focus:border-process-cyan focus:bg-process-cyan/15"
              role="button"
              tabIndex={0}
            >
              ?
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-50 w-max max-w-[300px] translate-y-1 rounded-lg border border-process-cyan/30 bg-[#090b1a] px-3 py-2 text-left text-[11px] font-bold text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                {selectedQuarter?.breakdown ?? "0 kWh"}
              </span>
            </span>
            ={" "}
            <strong className="ml-1 text-white">
              {selectedQuarter?.totalKwh.toLocaleString("ko-KR", {
                maximumFractionDigits: 2,
              }) ?? "0"}{" "}
              kWh
            </strong>
          </div>
        </div>
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
  const [quarterTargets, setQuarterTargets] = useState<Record<string, string>>(
    DEFAULT_QUARTER_TARGETS,
  );
  const [isTargetManagerOpen, setIsTargetManagerOpen] = useState(false);
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [targetSaveError, setTargetSaveError] = useState<string | null>(null);
  const selectedYear = Number(selectedMonth.slice(0, 4));

  useEffect(() => {
    let active = true;
    setTargetSaveError(null);
    fetchQuarterTargets(selectedYear)
      .then((targets) => {
        if (active) setQuarterTargets(targets);
      })
      .catch(() => {
        if (active) setTargetSaveError("분기 목표를 불러오지 못했습니다.");
      });
    return () => {
      active = false;
    };
  }, [selectedYear]);

  async function handleSaveQuarterTargets(targets: Record<string, string>) {
    setIsSavingTargets(true);
    setTargetSaveError(null);
    try {
      const savedTargets = await saveQuarterTargets(selectedYear, targets);
      setQuarterTargets(savedTargets);
      setIsTargetManagerOpen(false);
    } catch {
      setTargetSaveError(
        "DB에 저장하지 못했습니다. 백엔드 연결을 확인해 주세요.",
      );
    } finally {
      setIsSavingTargets(false);
    }
  }

  return (
    <main className="min-h-screen min-w-[1180px] bg-[#090b1a] p-8 text-white">
      <div className="flex min-h-[calc(100vh-64px)] flex-col gap-5">
        <EsgHeader
          data={data}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          onOpenTargetManager={() => setIsTargetManagerOpen(true)}
        />
        <section className="grid grid-cols-4 gap-4">
          {data.kpis.map((kpi) => (
            <EsgKpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>
        <section className="grid items-stretch grid-cols-[minmax(0,1fr)_450px] gap-4">
          <MonthlySavingsChart
            rows={data.monthlySavings}
            title={data.trendTitle}
            subtitle={data.trendSubtitle}
          />
          <div className="flex h-full flex-col justify-between gap-4">
            <EcoImpactCard data={data} />
            <QuarterlyMilestones
              quarters={data.quarters}
              selectedMonth={selectedMonth}
              selectedMonthSavingKwh={data.target.actual}
              quarterTargets={quarterTargets}
            />
          </div>
        </section>
        <footer className="flex items-center justify-between pt-2">
          <p className="truncate text-xs text-[#626e8a]">
            © 2025 Intelligent Process Control Lab. All rights reserved. 본
            대시보드의 환경 수치는 탄소배출권(KOC) 공인 계산 가이드라인에
            의거하여 작성되었습니다.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              className="rounded-md bg-[#20273d] px-3 py-1.5 text-[11px] font-bold text-white"
              onClick={downloadEsgReport}
            >
              이사회 보고서 출력
            </button>
          </div>
        </footer>
      </div>
      {isTargetManagerOpen ? (
        <QuarterTargetManager
          targets={quarterTargets}
          onClose={() => setIsTargetManagerOpen(false)}
          onSave={handleSaveQuarterTargets}
          isSaving={isSavingTargets}
          saveError={targetSaveError}
        />
      ) : null}
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
    return (
      <main className="min-h-screen bg-[#090b1a] p-8 text-sm text-[#8f9bb3]">
        ESG 실데이터를 불러오는 중...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#090b1a] p-8 text-white">
        <p className="text-lg font-bold">ESG 데이터를 불러오지 못했습니다.</p>
        <p className="text-sm text-[#8f9bb3]">
          백엔드 서버 주소와 실행 상태를 확인해 주세요.
        </p>
        <button
          className="rounded-md bg-process-green px-4 py-2 text-sm font-bold text-black"
          onClick={() => void refetch()}
        >
          다시 시도
        </button>
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

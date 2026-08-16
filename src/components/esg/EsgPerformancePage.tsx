import { memo, useMemo } from "react";
import type { EsgKpi, EsgPerformance, EsgTone, MonthlySaving, QuarterMilestone } from "../../api/esg";
import { useEsgPerformance } from "../../hooks/useEsgPerformance";

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
      const x = (index / (values.length - 1)) * width;
      const y = scaleY(value, max, height);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function EsgHeader({ data }: { data: EsgPerformance }) {
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
        <div className="flex items-center gap-2 rounded-lg border border-[#20273d] bg-[#121626] px-3 py-1.5">
          <img alt="" className="size-4" src={calendarIcon} />
          <p className="whitespace-nowrap text-[13px] font-semibold text-white">{data.period}</p>
        </div>
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
    const max = 200;
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
    const best = rows.reduce((top, row, index) => (row.monthly > top.row.monthly ? { row, index } : top), { row: rows[0], index: 0 });

    return { width, height, max, monthlyPath, cumulativePath, areaPath, best };
  }, [rows]);

  return (
    <section className="flex h-[520px] min-w-0 flex-col gap-5 rounded-card border border-[#20273d] bg-[#121626] p-6">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-base font-bold text-white">월별 에너지 절감 추이 (Monthly Energy Savings)</p>
          <p className="truncate text-[13px] text-[#8f9bb3]">2025년 1월 ~ 12월 누적 및 단일 절감 현황</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-[#8f9bb3]">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-process-green" />월간 절감량</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-[#f59e0b]" />누적 절감량</span>
        </div>
      </div>
      <div className="flex h-[200px] min-w-0 gap-2">
        <div className="flex h-full w-8 shrink-0 flex-col justify-between text-right text-[11px] text-[#626e8a]">
          {[200, 150, 100, 50, 0].map((tick) => <p key={tick}>{tick}</p>)}
        </div>
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[200px] min-w-0 flex-1 overflow-visible">
          {[10, 55, 100, 145, 190].map((y) => <line key={y} x1="0" x2={chart.width} y1={y} y2={y} stroke="#20273d" strokeWidth="1" />)}
          {rows.map((row, index) => {
            const x = (index / (rows.length - 1)) * chart.width;
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
          <circle cx={(chart.best.index / (rows.length - 1)) * chart.width} cy={scaleY(chart.best.row.monthly, chart.max, chart.height)} r="5" fill="#10b981" />
          <foreignObject x="612" y="-18" width="110" height="26">
            <div className="rounded border border-[#20273d] bg-[#090b1a] px-2 py-1 text-[11px] font-bold text-white">최고 성과: 185 MWh</div>
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
      <p className="text-[15px] font-bold text-white">분기별 목표 달성률 (Quarterly Milestones)</p>
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
        <p className="min-w-0 text-xs font-semibold text-process-cyan">연간 누적 초과 달성 (목표: {target.goal.toLocaleString()} MWh → 실적: {target.actual.toLocaleString()} MWh)</p>
      </div>
    </section>
  );
}

function EsgPageContent({ data }: { data: EsgPerformance }) {
  return (
    <main className="min-h-screen min-w-[1180px] bg-[#090b1a] p-8 text-white">
      <div className="flex min-h-[calc(100vh-64px)] flex-col gap-5">
        <EsgHeader data={data} />
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
  const { data } = useEsgPerformance();

  if (!data) {
    return <main className="min-h-screen bg-[#090b1a] p-8 text-sm text-[#8f9bb3]">ESG 데이터를 불러오는 중</main>;
  }

  return <EsgPageContent data={data} />;
}

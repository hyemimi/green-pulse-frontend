export type EsgTone = "cyan" | "green" | "amber";

export type EsgKpi = {
  id: string;
  label: string;
  value: string;
  unit: string;
  tone: EsgTone;
  icon: string;
  badge: string;
  description: string;
};

export type MonthlySaving = {
  month: string;
  monthly: number;
  cumulative: number;
};

export type EcoImpact = {
  icon: string;
  text: string;
  highlight: string;
  suffix: string;
};

export type QuarterMilestone = {
  label: string;
  percent: number;
  tone: "green" | "amber";
  note?: string;
};

export type EsgPerformance = {
  period: string;
  status: string;
  subtitle: string;
  kpis: EsgKpi[];
  monthlySavings: MonthlySaving[];
  ecoImpact: EcoImpact[];
  quarters: QuarterMilestone[];
  target: {
    goal: number;
    actual: number;
    unit: string;
  };
};

type BackendEsgSummary = {
  period: { from: string | null; to: string | null };
  savingRecordCount: number;
  energySavedKwh: number;
  co2ReducedKg: number;
  costSavedKrw: number;
  equivalents: {
    paperCups: number | null;
    carDistanceKm: number | null;
    pineTreesPerYear: number | null;
    tissueRolls: number | null;
  };
  targetAchievementPct: number | null;
};

type BackendMonthlySaving = {
  month: string;
  savingRecordCount: number;
  energySavedKwh: number;
  cumulativeEnergySavedKwh: number;
};

const energyIcon = "https://www.figma.com/api/mcp/asset/b4072f31-b3e3-49e6-b678-5a20b9d5b91c.svg";
const carbonIcon = "https://www.figma.com/api/mcp/asset/fb2b2d86-c358-4337-818e-fb7743992460.svg";
const costIcon = "https://www.figma.com/api/mcp/asset/c31050bc-8575-4ab3-ac4a-3d65ea1c6d3f.svg";
const detectionIcon = "https://www.figma.com/api/mcp/asset/cbe62bd5-1c41-419c-9625-20472b7b66ff.svg";

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallbackUrl = import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://dev-green-pulse-backend.onrender.com";

  return (configuredUrl || fallbackUrl).replace(/\/$/, "");
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`);

  if (!response.ok) {
    throw new Error(`ESG API 요청에 실패했습니다. (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchEsgPerformance(): Promise<EsgPerformance> {
  const [summary, monthly] = await Promise.all([
    fetchJson<BackendEsgSummary>("/api/esg/summary?holdMin=0"),
    fetchJson<BackendMonthlySaving[]>("/api/esg/monthly?holdMin=0"),
  ]);

  const monthlySavings = monthly.map((row) => ({
    month: formatMonth(row.month),
    monthly: row.energySavedKwh,
    cumulative: row.cumulativeEnergySavedKwh,
  }));
  const annualGoalKwh = getAnnualGoal(summary);

  return {
    period: formatPeriod(monthly, summary.period),
    status: "LIVE DATA CONNECTED",
    subtitle: "AI 조기 탐지 기반 화학공정 ESG 절감 성과",
    kpis: [
      {
        id: "energy",
        label: "에너지 절감량",
        value: formatNumber(summary.energySavedKwh, 2),
        unit: "kWh",
        tone: "cyan",
        icon: energyIcon,
        badge: `${summary.savingRecordCount.toLocaleString("ko-KR")}건 계산`,
        description: "고장 시작부터 AI 탐지 전까지의 전력 손실 기준",
      },
      {
        id: "carbon",
        label: "CO₂ 배출 저감량",
        value: formatNumber(summary.co2ReducedKg, 2),
        unit: "kgCO₂e",
        tone: "green",
        icon: carbonIcon,
        badge: "전력 절감량 환산",
        description: "설정된 전력 CO₂ 배출계수 적용",
      },
      {
        id: "cost",
        label: "비용 절감액",
        value: `₩${formatNumber(summary.costSavedKrw, 0)}`,
        unit: "원",
        tone: "amber",
        icon: costIcon,
        badge: summary.costSavedKrw > 0 ? "전력 단가 적용" : "전력 단가 설정 필요",
        description: summary.costSavedKrw > 0 ? "절감 전력량에 전력 단가를 적용한 값" : "백엔드 전력 단가가 현재 0원으로 설정됨",
      },
      {
        id: "detection",
        label: "절감량 계산 완료",
        value: summary.savingRecordCount.toLocaleString("ko-KR"),
        unit: "건",
        tone: "green",
        icon: detectionIcon,
        badge: "AI 탐지 에피소드",
        description: "정상 탐지 시각이 확인된 고장 사례",
      },
    ],
    monthlySavings,
    ecoImpact: [
      {
        icon: "🌳",
        text: "소나무 약",
        highlight: `${formatNumber(summary.equivalents.pineTreesPerYear, 2)}그루`,
        suffix: "1년간 흡수 효과",
      },
      {
        icon: "🚗",
        text: "승용차 주행 약",
        highlight: `${formatNumber(summary.equivalents.carDistanceKm, 1)}km`,
        suffix: "배출량 감축 효과",
      },
      {
        icon: "🥤",
        text: "종이컵 약",
        highlight: `${formatNumber(summary.equivalents.paperCups, 0)}개`,
        suffix: "생산 탄소량 감축 효과",
      },
    ],
    quarters: buildQuarterMilestones(monthly),
    target: {
      goal: annualGoalKwh,
      actual: summary.energySavedKwh,
      unit: "kWh",
    },
  };
}

function buildQuarterMilestones(monthly: BackendMonthlySaving[]): QuarterMilestone[] {
  const totals = [0, 0, 0, 0];

  for (const row of monthly) {
    const monthIndex = new Date(row.month).getUTCMonth();
    totals[Math.floor(monthIndex / 3)] += row.energySavedKwh;
  }

  const max = Math.max(...totals, 1);

  return totals.map((total, index) => ({
    label: `Q${index + 1}`,
    percent: Math.round((total / max) * 100),
    tone: total === max && total > 0 ? "amber" : "green",
    note: `${formatNumber(total, 2)} kWh`,
  }));
}

function getAnnualGoal(summary: BackendEsgSummary) {
  if (!summary.targetAchievementPct || summary.targetAchievementPct <= 0) {
    return 0;
  }

  return summary.energySavedKwh / (summary.targetAchievementPct / 100);
}

function formatMonth(value: string) {
  const date = new Date(value);
  return `${date.getUTCMonth() + 1}월`;
}

function formatPeriod(monthly: BackendMonthlySaving[], period: BackendEsgSummary["period"]) {
  if (period.from || period.to) {
    return `${period.from ?? "시작"} - ${period.to ?? "현재"}`;
  }
  if (monthly.length === 0) {
    return "조회 기간 없음";
  }

  const first = new Date(monthly[0].month);
  const last = new Date(monthly[monthly.length - 1].month);
  return `${first.getUTCFullYear()}.${String(first.getUTCMonth() + 1).padStart(2, "0")} - ${last.getUTCFullYear()}.${String(last.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatNumber(value: number | null, maximumFractionDigits: number) {
  return (value ?? 0).toLocaleString("ko-KR", { maximumFractionDigits });
}

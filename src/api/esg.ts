import { fetchServerJson, sendServerJson } from "./client";
import { ESG_MONTH_OPTIONS } from "../constants/demoTimeline";

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
  period: string;
  tone: "green" | "amber";
  note: string;
  breakdown: string;
  totalKwh: number;
};

export type EsgPerformance = {
  period: string;
  selectedMonth: string;
  availableMonths: string[];
  trendTitle: string;
  trendSubtitle: string;
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
  totalUnmitigatedLossKwh: number;
  savingRatePct: number;
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

export type QuarterTargets = Record<string, string>;

type BackendQuarterTargets = {
  year: number;
  targets: Array<{
    quarter: number;
    targetKwh: number;
    updatedAt: string;
  }>;
};

type BackendTrainingEstimate = BackendEsgSummary & {
  measurementMode: "TRAINING_DATA_ESTIMATE";
  assumedDetectionMin: number;
  dailySavings: Array<{
    date: string;
    energySavedKwh: number;
    cumulativeEnergySavedKwh: number;
  }>;
};

type BackendMonthlySaving = {
  month: string;
  savingRecordCount: number;
  totalUnmitigatedLossKwh: number;
  savingRatePct: number;
  energySavedKwh: number;
  cumulativeEnergySavedKwh: number;
};

type BackendDetection = {
  reactorId: string;
  faultOnset: string;
  detectedAt: string;
  predictedFault: string;
};

type BackendPowerSaving = {
  savedKwh: number;
};

const energyIcon = "https://www.figma.com/api/mcp/asset/b4072f31-b3e3-49e6-b678-5a20b9d5b91c.svg";
const carbonIcon = "https://www.figma.com/api/mcp/asset/fb2b2d86-c358-4337-818e-fb7743992460.svg";
const costIcon = "https://www.figma.com/api/mcp/asset/c31050bc-8575-4ab3-ac4a-3d65ea1c6d3f.svg";
const detectionIcon = "https://www.figma.com/api/mcp/asset/cbe62bd5-1c41-419c-9625-20472b7b66ff.svg";

export async function fetchQuarterTargets(year: number): Promise<QuarterTargets> {
  const response = await fetchServerJson<BackendQuarterTargets>(`/api/esg/quarter-targets?year=${year}`);
  return mapQuarterTargets(response);
}

export async function saveQuarterTargets(year: number, targets: QuarterTargets): Promise<QuarterTargets> {
  const response = await sendServerJson<BackendQuarterTargets>("/api/esg/quarter-targets", "PUT", {
    year,
    targets: Object.entries(targets)
      .map(([quarter, targetKwh]) => ({
        quarter: Number(quarter.slice(1)),
        targetKwh: Number(targetKwh),
      }))
      .filter((target) => Number.isFinite(target.targetKwh) && target.targetKwh > 0),
  });
  return mapQuarterTargets(response);
}

function mapQuarterTargets(response: BackendQuarterTargets): QuarterTargets {
  const targets: QuarterTargets = { Q1: "", Q2: "", Q3: "", Q4: "" };
  response.targets.forEach((target) => {
    targets[`Q${target.quarter}`] = String(target.targetKwh);
  });
  return targets;
}

export async function fetchEsgPerformance(selectedMonth: string): Promise<EsgPerformance> {
  const { from, to } = monthRange(selectedMonth);
  const isTrainingEstimate = selectedMonth === "2024-01";
  const trainingEstimatePath = "/api/esg/training-estimate?from=2024-01-01&to=2024-01-31&assumedDetectionMin=15";
  const [testSummary, monthly, januaryTrainingEstimate] = await Promise.all([
    isTrainingEstimate
      ? Promise.resolve<BackendEsgSummary | null>(null)
      : fetchServerJson<BackendEsgSummary>(`/api/esg/summary?holdMin=0&from=${from}&to=${to}`),
    fetchServerJson<BackendMonthlySaving[]>("/api/esg/monthly?holdMin=0"),
    fetchServerJson<BackendTrainingEstimate>(trainingEstimatePath),
  ]);
  const summary = isTrainingEstimate ? januaryTrainingEstimate : testSummary!;

  const dailySavings = isTrainingEstimate
    ? fillDailySavings(selectedMonth, januaryTrainingEstimate.dailySavings)
    : await fetchDailySavings(selectedMonth);
  const monthlyWithTrainingEstimate = [
    {
      month: "2024-01-01",
      savingRecordCount: januaryTrainingEstimate.savingRecordCount,
      totalUnmitigatedLossKwh: januaryTrainingEstimate.totalUnmitigatedLossKwh,
      savingRatePct: januaryTrainingEstimate.savingRatePct,
      energySavedKwh: januaryTrainingEstimate.energySavedKwh,
      cumulativeEnergySavedKwh: januaryTrainingEstimate.energySavedKwh,
    },
    ...monthly,
  ];
  const annualGoalKwh = getAnnualGoal(summary);

  return {
    period: selectedMonth.replace("-", "."),
    selectedMonth,
    availableMonths: [...new Set([
      ...ESG_MONTH_OPTIONS,
      ...monthly.map((row) => row.month.slice(0, 7)),
    ])].sort(),
    trendTitle: `${selectedMonth.replace("-", ".")} 일별 에너지 절감 추이`,
    trendSubtitle: isTrainingEstimate
      ? "학습 데이터의 실제 이상 구간을 사용하고 이상 시작 15분 후 탐지를 가정한 추정값입니다."
      : "해당 월의 테스트 탐지 결과를 날짜별로 계산한 절감량입니다.",
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
        description: isTrainingEstimate
          ? "학습 데이터 이상 시작부터 가정 탐지 시점까지의 전력 손실 기준"
          : "고장 시작부터 AI 탐지 전까지의 전력 손실 기준",
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
        badge: isTrainingEstimate ? "학습 이상 구간" : "AI 탐지 에피소드",
        description: isTrainingEstimate ? "학습 데이터에서 확인된 실제 이상 구간" : "정상 탐지 시각이 확인된 고장 사례",
      },
    ],
    monthlySavings: dailySavings,
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
    quarters: buildQuarterMilestones(monthlyWithTrainingEstimate, selectedMonth),
    target: {
      goal: annualGoalKwh,
      actual: summary.energySavedKwh,
      unit: "kWh",
    },
  };
}

async function fetchDailySavings(selectedMonth: string): Promise<MonthlySaving[]> {
  const detections = await fetchServerJson<BackendDetection[]>("/api/detections?holdMin=0");
  const selectedDetections = detections.filter(
    (detection) => detection.detectedAt?.slice(0, 7) === selectedMonth,
  );
  const savings = await Promise.all(
    selectedDetections.map((detection) => {
      const query = new URLSearchParams({
        reactorId: detection.reactorId,
        predictedFault: detection.predictedFault,
        onsetTimestamp: detection.faultOnset,
        detectTimestamp: detection.detectedAt,
      });

      return fetchServerJson<BackendPowerSaving>(`/api/esg/power-saving?${query.toString()}`);
    }),
  );
  const totalsByDay = new Map<string, number>();

  selectedDetections.forEach((detection, index) => {
    const day = detection.detectedAt.slice(0, 10);
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + savings[index].savedKwh);
  });

  return fillDailySavings(
    selectedMonth,
    [...totalsByDay.entries()].map(([date, energySavedKwh]) => ({ date, energySavedKwh })),
  );
}

function fillDailySavings(
  selectedMonth: string,
  rows: Array<{ date: string; energySavedKwh: number }>,
): MonthlySaving[] {
  const totalsByDay = new Map(rows.map((row) => [row.date, row.energySavedKwh]));

  const [year, month] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let cumulative = 0;

  return Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const date = `${selectedMonth}-${String(dayNumber).padStart(2, "0")}`;
    const daily = totalsByDay.get(date) ?? 0;
    cumulative += daily;

    return {
      month: `${month}/${dayNumber}`,
      monthly: daily,
      cumulative,
    };
  });
}

function buildQuarterMilestones(
  monthly: BackendMonthlySaving[],
  selectedMonth: string,
): QuarterMilestone[] {
  const totals = [0, 0, 0, 0];
  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
  const valuesByMonth = new Map<string, number>();

  for (const row of monthly) {
    const rowYear = new Date(row.month).getUTCFullYear();
    if (rowYear !== selectedYear) continue;

    const monthIndex = new Date(row.month).getUTCMonth();
    const quarterIndex = Math.floor(monthIndex / 3);
    const rowMonth = row.month.slice(0, 7);
    valuesByMonth.set(rowMonth, row.energySavedKwh);

    if (rowMonth <= selectedMonth) {
      totals[quarterIndex] += row.energySavedKwh;
    }
  }

  return totals.map((total, index) => {
    const startMonth = index * 3 + 1;
    const endMonth = startMonth + 2;
    const includedEndMonth = Math.min(endMonth, selectedMonthNumber);
    const includedMonths = includedEndMonth >= startMonth
      ? Array.from({ length: includedEndMonth - startMonth + 1 }, (_, monthIndex) => startMonth + monthIndex)
      : [];
    const terms = includedMonths.map((month) => {
      const monthKey = `${selectedYear}-${String(month).padStart(2, "0")}`;
      return formatNumber(valuesByMonth.get(monthKey) ?? 0, 2);
    });

    return {
      label: `Q${index + 1}`,
      period: `${startMonth}~${endMonth}월`,
      tone: total > 0 ? "amber" : "green",
      note: `${formatNumber(total, 2)} kWh`,
      breakdown: terms.length > 0
        ? `${terms.join(" + ")} = ${formatNumber(total, 2)} kWh`
        : "아직 집계 전",
      totalKwh: total,
    };
  });
}

function getAnnualGoal(summary: BackendEsgSummary) {
  if (!summary.targetAchievementPct || summary.targetAchievementPct <= 0) {
    return 0;
  }

  return summary.energySavedKwh / (summary.targetAchievementPct / 100);
}

function monthRange(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    from: `${selectedMonth}-01`,
    to: `${selectedMonth}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatNumber(value: number | null, maximumFractionDigits: number) {
  return (value ?? 0).toLocaleString("ko-KR", { maximumFractionDigits });
}

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
  };
};

export async function fetchEsgPerformance(): Promise<EsgPerformance> {
  const response = await fetch("/mock/esg-performance.json");

  if (!response.ok) {
    throw new Error("Failed to fetch ESG performance mock data");
  }

  return response.json() as Promise<EsgPerformance>;
}

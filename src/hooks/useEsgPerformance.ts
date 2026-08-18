import { useQuery } from "@tanstack/react-query";
import { fetchEsgPerformance } from "../api/esg";

export function useEsgPerformance(selectedMonth: string) {
  return useQuery({
    queryKey: ["esg-performance", selectedMonth],
    queryFn: () => fetchEsgPerformance(selectedMonth),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchEsgPerformance } from "../api/esg";

export function useEsgPerformance() {
  return useQuery({
    queryKey: ["esg-performance"],
    queryFn: fetchEsgPerformance,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

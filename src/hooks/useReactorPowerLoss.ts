import { useQuery } from "@tanstack/react-query";
import { fetchReactorPowerLoss } from "../api/dashboard";

export function useReactorPowerLoss(playbackMinute: number) {
  return useQuery({
    queryKey: ["reactor-power-loss", playbackMinute],
    queryFn: () => fetchReactorPowerLoss(playbackMinute),
    refetchInterval: false,
  });
}

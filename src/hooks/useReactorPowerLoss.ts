import { useQuery } from "@tanstack/react-query";
import { fetchReactorPowerLoss } from "../api/dashboard";

export function useReactorPowerLoss() {
  return useQuery({
    queryKey: ["reactor-power-loss"],
    queryFn: fetchReactorPowerLoss,
  });
}

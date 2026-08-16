import { useQuery } from "@tanstack/react-query";
import { fetchSensorTrends } from "../api/dashboard";

export function useSensorTrends() {
  return useQuery({
    queryKey: ["sensor-trends", "A_R2", "2024-03-14 19:06:00"],
    queryFn: fetchSensorTrends,
  });
}

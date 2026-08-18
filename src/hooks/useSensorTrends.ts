import { useQuery } from "@tanstack/react-query";
import { fetchSensorTrends } from "../api/dashboard";

export function useSensorTrends(reactorId: string) {
  return useQuery({
    queryKey: ["sensor-trends", reactorId],
    queryFn: () => fetchSensorTrends(reactorId),
  });
}

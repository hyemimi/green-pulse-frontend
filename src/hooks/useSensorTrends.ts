import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeSensorTrend, fetchSensorTrends } from "../api/dashboard";

export function useSensorTrends(reactorId: string, episodeId: number | null) {
  return useQuery({
    queryKey: episodeId !== null ? ["sensor-trends", "episode", episodeId] : ["sensor-trends", "reactor", reactorId],
    queryFn: () => (episodeId !== null ? fetchEpisodeSensorTrend(episodeId) : fetchSensorTrends(reactorId)),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchDetections } from "../api/detections";

export function useDetections() {
  return useQuery({
    queryKey: ["detections"],
    queryFn: fetchDetections,
  });
}

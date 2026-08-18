import { serverApiUrl } from "./client";
import { DEMO_DATE } from "../constants/demoTimeline";
import { shiftIsoTimestamp } from "../utils/date";

export type Detection = {
  episode_id: number;
  reactor_id: string;
  fault_type: string;
  fault_onset: string;
  detected_at: string;
  delay_min: number;
  predicted_fault: string;
  specialist: string;
  score: number;
};

type BackendDetection = {
  episodeId: number;
  reactorId: string;
  faultType: string;
  faultOnset: string;
  detectedAt: string;
  delayMin: number;
  predictedFault: string;
  specialist: string;
  score: number;
};

export async function fetchDetections(): Promise<Detection[]> {
  const response = await fetch(serverApiUrl("/api/detections"));

  if (!response.ok) {
    throw new Error("Failed to fetch detections");
  }

  const rows: BackendDetection[] = await response.json();

  const detections = rows
    .map((row) => ({
      episode_id: row.episodeId,
      reactor_id: row.reactorId,
      fault_type: row.faultType,
      fault_onset: row.faultOnset,
      detected_at: row.detectedAt,
      delay_min: row.delayMin,
      predicted_fault: row.predictedFault,
      specialist: row.specialist,
      score: row.score,
    }))
    .filter((row) => row.fault_onset.slice(0, 10) === DEMO_DATE);

  const latestDetectionTime = Math.max(
    ...detections.map((detection) => new Date(detection.detected_at).getTime()),
  );
  const offsetMs = Number.isFinite(latestDetectionTime) ? Date.now() - latestDetectionTime : 0;

  return detections.map((detection) => ({
    ...detection,
    fault_onset: shiftIsoTimestamp(detection.fault_onset, offsetMs),
    detected_at: shiftIsoTimestamp(detection.detected_at, offsetMs),
  }));
}

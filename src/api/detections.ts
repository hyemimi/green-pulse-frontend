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
  const response = await fetch("http://localhost:3000/api/detections");

  if (!response.ok) {
    throw new Error("Failed to fetch detections");
  }

  const rows: BackendDetection[] = await response.json();

  return rows.map((row) => ({
    episode_id: row.episodeId,
    reactor_id: row.reactorId,
    fault_type: row.faultType,
    fault_onset: row.faultOnset,
    detected_at: row.detectedAt,
    delay_min: row.delayMin,
    predicted_fault: row.predictedFault,
    specialist: row.specialist,
    score: row.score,
  }));
}
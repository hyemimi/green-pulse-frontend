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

const baseDetections: Detection[] = [
  {
    episode_id: 17,
    reactor_id: "A_R2",
    fault_type: "F1",
    fault_onset: "2024-03-14 19:06:00",
    detected_at: "2024-03-14 19:08:00",
    delay_min: 2,
    predicted_fault: "F1",
    specialist: "thermal_after_hold",
    score: 1,
  },
];

const relatedLiveDetections: Detection[] = [
  {
    episode_id: 18,
    reactor_id: "A_R2",
    fault_type: "F3",
    fault_onset: "2024-03-14 19:12:00",
    detected_at: "2024-03-14 19:14:00",
    delay_min: 2,
    predicted_fault: "F3",
    specialist: "current_spike",
    score: 0.94,
  },
  {
    episode_id: 19,
    reactor_id: "D_R1",
    fault_type: "F1",
    fault_onset: "2024-03-14 19:22:00",
    detected_at: "2024-03-14 19:25:00",
    delay_min: 3,
    predicted_fault: "F1",
    specialist: "temperature_drift",
    score: 0.88,
  },
  {
    episode_id: 20,
    reactor_id: "B_R3",
    fault_type: "F2",
    fault_onset: "2024-03-14 19:31:00",
    detected_at: "2024-03-14 19:33:00",
    delay_min: 2,
    predicted_fault: "F2",
    specialist: "pressure_pattern",
    score: 0.82,
  },
  {
    episode_id: 21,
    reactor_id: "F_R1",
    fault_type: "F4",
    fault_onset: "2024-03-14 19:40:00",
    detected_at: "2024-03-14 19:43:00",
    delay_min: 3,
    predicted_fault: "F4",
    specialist: "flow_drop",
    score: 0.72,
  },
];

export async function fetchDetections(): Promise<Detection[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  return [...baseDetections, ...relatedLiveDetections];
}

// Placeholder ML staging model stub.
// In future, replace with a TF.js loaded model and sequence feature input.
export type ModelFeatures = { hr: number; movementMagnitude: number; timeOfNightMinutes: number };

export function predictStageStub(f: ModelFeatures): { stage: string; confidence: number } {
  // Simple heuristic pretending to be a model probability output
  if (f.movementMagnitude < 0.25 && f.hr < 58) return { stage: 'N3', confidence: 0.7 };
  if (f.movementMagnitude > 1.6) return { stage: 'REM', confidence: 0.6 };
  if (f.movementMagnitude < 0.9) return { stage: 'N2', confidence: 0.55 };
  return { stage: 'N1', confidence: 0.5 };
}

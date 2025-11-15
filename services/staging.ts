export type Stage = 'N3' | 'REM' | 'N2' | 'N1';
export type Features = { hr: number; movementMagnitude: number };

let hrBaseline: number | undefined;

export function inferStage(f: Features): Stage {
  if (!hrBaseline) hrBaseline = f.hr;
  const hrDelta = f.hr - hrBaseline;
  if (f.movementMagnitude < 0.3 && hrDelta < -5) return 'N3';
  if (f.movementMagnitude > 1.8 && hrDelta > 1) return 'REM';
  if (f.movementMagnitude < 1.0) return 'N2';
  return 'N1';
}

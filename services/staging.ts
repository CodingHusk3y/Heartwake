export type Stage = 'N3' | 'REM' | 'N2' | 'N1';
export type Features = { hr: number; movementMagnitude: number };

// Short- and long-term HR averages for trend detection
let hrFast: number | undefined;
let hrSlow: number | undefined;

export function inferStage(f: Features): Stage {
  if (hrFast === undefined) hrFast = f.hr;
  if (hrSlow === undefined) hrSlow = f.hr;
  // Update EMAs (fast reacts to recent changes, slow tracks baseline)
  hrFast = 0.5 * f.hr + 0.5 * hrFast;     // fast EMA
  hrSlow = 0.9 * hrSlow + 0.1 * f.hr;     // slow EMA
  const hrDelta = hrFast - hrSlow;        // positive: rising, negative: falling

  const move = f.movementMagnitude;
  // Heuristic rules:
  // - Deep (N3): very low movement and HR trending down noticeably
  if (move < 0.4 && hrDelta < -2) return 'N3';
  // - REM: high movement or HR trending up
  if (move > 1.6 || hrDelta > 2) return 'REM';
  // - Light (N2) when relatively calm
  if (move < 1.1) return 'N2';
  // - Otherwise lightest (N1)
  return 'N1';
}

export function resetStaging() {
  hrFast = undefined;
  hrSlow = undefined;
}

import type { Stage } from '../types'

// SVG viewBox: 0 0 1000 500
export const VIEW_WIDTH = 1000
export const VIEW_HEIGHT = 500

// X ranges for each stage (in SVG coordinates)
export const STAGE_X_RANGES: Record<Stage, [number, number]> = {
  innovation_trigger: [30, 200],
  peak_of_expectations: [200, 350],
  trough_of_disillusionment: [350, 540],
  slope_of_enlightenment: [540, 790],
  plateau_of_productivity: [790, 970],
}

// Convert (stage, position[0,1]) → SVG x coordinate
export function stagePositionToX(stage: Stage, position: number): number {
  const [xStart, xEnd] = STAGE_X_RANGES[stage]
  return xStart + Math.max(0, Math.min(1, position)) * (xEnd - xStart)
}

// Convert SVG x coordinate → (stage, position[0,1])
export function xToStagePosition(stage: Stage, x: number): number {
  const [xStart, xEnd] = STAGE_X_RANGES[stage]
  return Math.max(0, Math.min(1, (x - xStart) / (xEnd - xStart)))
}

// Cubic bezier: compute point at parameter t ∈ [0,1]
function cubicBezier(
  p0: number, p1: number, p2: number, p3: number,
  t: number,
): number {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

// Gartner-like Hype Cycle curve.
//
// The curve is composed of cubic Bezier segments.
// Each segment is:
//
//   [x0, y0, cx1, cy1, cx2, cy2, x1, y1]
//
// Note:
// - Smaller y means higher expectations.
// - The curve is intentionally asymmetric:
//   rapid rise, sharp decline, shallow trough, then gradual recovery.

const CURVE_SEGMENTS = [
  // 1. Innovation Trigger
  //
  // Starts almost flat, then gradually accelerates upward.
  // This represents the period where initial interest begins to build,
  // but expectations are still relatively low.
  [30, 430,   75, 425,  125, 390,  165, 325],

  // 2. Rapid rise toward the Peak of Inflated Expectations
  //
  // Expectations increase rapidly as attention and enthusiasm grow.
  // The second control point is aligned horizontally with the peak,
  // which makes the transition into the peak smooth and rounded.
  [165, 325,  205, 245,  250,  25,  275,  25],

  // 3. Peak of Inflated Expectations -> beginning of decline
  //
  // The first control point is horizontally aligned with the peak.
  // Together with the previous segment, this creates a smooth,
  // rounded peak without a visible corner.
  //
  // After the peak, expectations begin to fall quickly.
  [275,  25,  300,  25,  310, 145,  350, 265],

  // 4. Rapid decline into the Trough of Disillusionment
  //
  // Expectations continue to fall, but the rate of decline gradually
  // slows as the curve approaches the bottom.
  //
  // The trough is intentionally shallower than in the earlier version,
  // with its bottom around y=400.
  [350, 265,  385, 360,  430, 400,  500, 400],

  // 5. Trough of Disillusionment -> Slope of Enlightenment
  //
  // The curve stays relatively flat around the trough for a while,
  // then begins a gradual recovery as practical understanding grows.
  //
  // The long, gentle transition helps distinguish this recovery
  // from the much steeper initial hype phase.
  [500, 400,  570, 400,  620, 330,  730, 280],

  // 6. Slope of Enlightenment -> Plateau of Productivity
  //
  // Expectations continue to recover, but the slope gradually decreases.
  // The curve approaches a stable plateau rather than continuing upward.
  [730, 280,  815, 235,  900, 215,  970, 210],
];

// Find y value on the curve for a given x using linear search + interpolation
export function getYForX(targetX: number): number {
  for (const seg of CURVE_SEGMENTS) {
    const [x0, y0, cx1, cy1, cx2, cy2, x1, y1] = seg
    if (targetX < x0 || targetX > x1) continue

    // Binary search for t that gives targetX
    let lo = 0
    let hi = 1
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2
      const xMid = cubicBezier(x0, cx1, cx2, x1, mid)
      if (xMid < targetX) lo = mid
      else hi = mid
    }
    const t = (lo + hi) / 2
    return cubicBezier(y0, cy1, cy2, y1, t)
  }

  // Fallback: plateau y
  return 210
}

// Build the SVG path string for the hype cycle curve
export function buildCurvePath(): string {
  const first = CURVE_SEGMENTS[0]
  let d = `M ${first[0]},${first[1]}`
  for (const seg of CURVE_SEGMENTS) {
    const [, , cx1, cy1, cx2, cy2, x1, y1] = seg
    d += ` C ${cx1},${cy1} ${cx2},${cy2} ${x1},${y1}`
  }
  return d
}

// Stage boundary x coordinates for divider lines
export const STAGE_BOUNDARIES = [
  STAGE_X_RANGES.innovation_trigger[1],
  STAGE_X_RANGES.peak_of_expectations[1],
  STAGE_X_RANGES.trough_of_disillusionment[1],
  STAGE_X_RANGES.slope_of_enlightenment[1],
]

// Stage label center x positions
export function stageLabelX(stage: Stage): number {
  const [xStart, xEnd] = STAGE_X_RANGES[stage]
  return (xStart + xEnd) / 2
}

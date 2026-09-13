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

// The hype cycle curve is defined as a sequence of G1-continuous cubic bezier segments.
// Each segment: [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
// G1 rule: last-CP → endpoint → first-CP of next segment must be collinear.
const CURVE_SEGMENTS = [
  // Innovation Trigger: gentle rise from flat start
  [30, 440,   75, 440,  140, 320,  200, 200],
  // Rise to peak — peak at x=275 (center of peak phase 200-350)
  // G1 at (200,200): tangent (60,-120) → first CP = (200+60*0.3, 200-120*0.3) = (218,164)
  [200, 200,  218, 164,  255,  20,  275,  20],
  // Drop from peak — horizontal peak (tangent = 0) → CPs at same y=20
  [275,  20,  295,  20,  360, 200,  400, 360],
  // Trough — G1 at (400,360): tangent (40,160) → first CP = (400+16, 360+64) = (416,424)
  [400, 360,  416, 424,  480, 460,  540, 455],
  // Slope of Enlightenment — G1 at (540,455): tangent (60,-5) → first CP = (570,452)
  // G1 at (790,220): tangent of this seg (30,-5) → next first CP = (820,215)
  [540, 455,  570, 452,  760, 225,  790, 220],
  // Plateau — G1 at (790,220): first CP = (820,215) collinear with (760,225)→(790,220)
  [790, 220,  820, 215,  900, 215,  970, 215],
]

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
  return 215
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

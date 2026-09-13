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

// The hype cycle curve is defined as a sequence of cubic bezier segments.
// Each segment: [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
// Peak moved to x=275 (center of peak phase 200-350); all other segments unchanged from v1.
const CURVE_SEGMENTS = [
  [30, 430,   80, 420,  160, 340,  200, 200],
  // Rise to peak: control points scaled to compress 200-310 → 200-275
  [200, 200,  220,  80,  245,  25,  275,  25],
  // Drop from peak: start shifted from 310 to 275, CP1 shifted proportionally
  [275,  25,  305,  25,  370, 180,  400, 350],
  [400, 350,  430, 430,  490, 450,  540, 450],
  [540, 450,  600, 420,  680, 280,  790, 230],
  [790, 230,  840, 210,  900, 210,  970, 210],
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

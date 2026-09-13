import { getYForX, stagePositionToX } from './curve'
import type { Entry } from '../types'

export interface LabelPosition {
  id: string
  cx: number   // curve x
  cy: number   // curve y
  lx: number   // label x (after overlap avoidance)
  ly: number   // label y (after overlap avoidance)
  keyword: string
}

const LABEL_HEIGHT = 18
const LABEL_CHAR_WIDTH = 7
const LABEL_PADDING = 4
const MAX_ITERATIONS = 30

function labelWidth(keyword: string): number {
  return keyword.length * LABEL_CHAR_WIDTH + LABEL_PADDING * 2 + 14 // 14 for icon
}

const LABEL_MIN_Y = 20
const LABEL_MAX_Y = 430

export function computeLabelPositions(entries: Entry[]): LabelPosition[] {
  const positions: LabelPosition[] = entries.map((e) => {
    const cx = stagePositionToX(e.stage, e.position)
    const cy = getYForX(cx)
    // Prefer label above the curve; if too low, flip to above the midpoint
    const initialLy = cy > 380 ? cy - 50 : cy - 28
    return { id: e.id, cx, cy, lx: cx, ly: Math.max(LABEL_MIN_Y, initialLy), keyword: e.keyword }
  })

  // Iterative push-out collision avoidance (Y direction only)
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let moved = false
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]
        const b = positions[j]
        const aw = labelWidth(a.keyword)
        const bw = labelWidth(b.keyword)
        const overlapX = Math.abs(a.lx - b.lx) < (aw + bw) / 2
        const overlapY = Math.abs(a.ly - b.ly) < LABEL_HEIGHT + 2
        if (overlapX && overlapY) {
          const push = (LABEL_HEIGHT + 2 - Math.abs(a.ly - b.ly)) / 2 + 1
          if (a.ly <= b.ly) {
            a.ly -= push
            b.ly += push
          } else {
            a.ly += push
            b.ly -= push
          }
          moved = true
        }
      }
    }
    // Clamp to visible area after each iteration
    for (const p of positions) {
      p.ly = Math.max(LABEL_MIN_Y, Math.min(LABEL_MAX_Y, p.ly))
    }
    if (!moved) break
  }

  return positions
}

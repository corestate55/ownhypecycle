import { getYForX, stagePositionToX } from './curve'
import type { Entry } from '../types'

export interface LabelPosition {
  id: string
  cx: number     // curve x — icon is placed here
  cy: number     // curve y — icon is placed here
  ly: number     // label y after overlap avoidance (lx = cx always)
  keyword: string
  displaced: boolean  // true if label was pushed away from curve
}

const LABEL_HEIGHT = 18
const LABEL_CHAR_WIDTH = 7.5
const LABEL_PADDING = 4
const ICON_SIZE = 12
const MAX_ITERATIONS = 30
const DISPLACE_THRESHOLD = 20

const LABEL_MIN_Y = 20
const LABEL_MAX_Y = 430

function labelWidth(keyword: string): number {
  return keyword.length * LABEL_CHAR_WIDTH + LABEL_PADDING * 2 + ICON_SIZE + 5
}

export function computeLabelPositions(entries: Entry[]): LabelPosition[] {
  const positions: LabelPosition[] = entries.map((e) => {
    const cx = stagePositionToX(e.stage, e.position)
    const cy = getYForX(cx)
    return { id: e.id, cx, cy, ly: cy, keyword: e.keyword, displaced: false }
  })

  // Iterative push-out collision avoidance (Y direction)
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let moved = false
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]
        const b = positions[j]
        const aw = labelWidth(a.keyword)
        const bw = labelWidth(b.keyword)
        const overlapX = Math.abs(a.cx - b.cx) < (aw + bw) / 2
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
    for (const p of positions) {
      p.ly = Math.max(LABEL_MIN_Y, Math.min(LABEL_MAX_Y, p.ly))
    }
    if (!moved) break
  }

  for (const p of positions) {
    p.displaced = Math.abs(p.ly - p.cy) > DISPLACE_THRESHOLD
  }

  return positions
}

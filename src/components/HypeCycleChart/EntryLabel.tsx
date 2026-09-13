import type { Entry } from '../../types'
import type { LabelPosition } from '../../utils/labelLayout'
import { STAGE_X_RANGES, xToStagePosition } from '../../utils/curve'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'
import { useRef } from 'react'

interface Props {
  entry: Entry
  labelPos: LabelPosition
  svgRef: React.RefObject<SVGSVGElement | null>
  onPositionChange: (id: string, position: number) => void
}

const ICON_SIZE = 12
// Plateau entries get text on the left side to avoid going off the right edge
const PLATEAU_STAGE = 'plateau_of_productivity'

export function EntryLabel({ entry, labelPos, svgRef, onPositionChange }: Props) {
  const dragging = useRef(false)

  function getSVGX(clientX: number): number {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    return ((clientX - rect.left) / rect.width) * viewBox.width
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    const [xStart, xEnd] = STAGE_X_RANGES[entry.stage]

    const onMove = (me: MouseEvent) => {
      if (!dragging.current) return
      const rawX = getSVGX(me.clientX)
      const clampedX = Math.max(xStart, Math.min(xEnd, rawX))
      onPositionChange(entry.id, xToStagePosition(entry.stage, clampedX))
    }

    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const { cx, cy, ly, displaced } = labelPos
  const isPlateauStage = entry.stage === PLATEAU_STAGE
  // Text position relative to icon
  const textX = isPlateauStage
    ? cx - ICON_SIZE / 2 - 4
    : cx + ICON_SIZE / 2 + 4
  const textAnchor = isPlateauStage ? 'end' : 'start'

  return (
    <g style={{ cursor: 'grab' }} onMouseDown={handleMouseDown}>
      {/* Spike line: only when label is displaced from the curve */}
      {displaced && (
        <line
          x1={cx} y1={cy}
          x2={cx} y2={ly}
          stroke="#bbb"
          strokeWidth={0.8}
          strokeDasharray="3,2"
          pointerEvents="none"
        />
      )}

      {/* Time-to-adoption icon placed ON the curve */}
      <g transform={`translate(${cx}, ${cy})`}>
        <TimeToAdoptionIcon type={entry.timeToAdoption} size={ICON_SIZE} />
      </g>

      {/* Keyword label — next to icon (on curve) or at displaced y */}
      <text
        x={textX}
        y={ly + 4}
        fontSize={12}
        textAnchor={textAnchor}
        fill="#1a1a1a"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {entry.keyword}
      </text>
    </g>
  )
}

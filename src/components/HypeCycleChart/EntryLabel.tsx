import type { Entry } from '../../types'
import type { LabelPosition } from '../../utils/labelLayout'
import { STAGE_X_RANGES, stagePositionToX, xToStagePosition } from '../../utils/curve'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'
import { useRef } from 'react'

interface Props {
  entry: Entry
  labelPos: LabelPosition
  svgRef: React.RefObject<SVGSVGElement | null>
  onPositionChange: (id: string, position: number) => void
}

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
      const newPosition = xToStagePosition(entry.stage, clampedX)
      onPositionChange(entry.id, newPosition)
    }

    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const { cx, cy, lx, ly } = labelPos
  const iconSize = 10
  const textX = lx + iconSize + 3

  // Determine text anchor based on position in chart
  const anchorX = stagePositionToX(entry.stage, entry.position)
  const textAnchor = anchorX > 800 ? 'end' : 'start'
  const adjustedLx = textAnchor === 'end' ? lx - iconSize - 3 : lx

  return (
    <g
      style={{ cursor: 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {/* Spike line from label to curve point */}
      <line
        x1={cx} y1={cy}
        x2={textAnchor === 'end' ? adjustedLx : lx}
        y2={ly}
        stroke="#999"
        strokeWidth={0.8}
        strokeDasharray="2,2"
        pointerEvents="none"
      />
      {/* Dot on curve */}
      <circle cx={cx} cy={cy} r={3} fill="#555" pointerEvents="none" />
      {/* Icon */}
      <g transform={`translate(${textAnchor === 'end' ? adjustedLx - iconSize / 2 : lx + iconSize / 2}, ${ly})`}>
        <TimeToAdoptionIcon type={entry.timeToAdoption} size={iconSize} />
      </g>
      {/* Label text */}
      <text
        x={textAnchor === 'end' ? adjustedLx - iconSize - 3 : textX}
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

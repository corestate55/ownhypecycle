import { useRef, useState } from 'react'
import type { Entry } from '../../types'
import type { LabelPosition } from '../../utils/labelLayout'
import { STAGE_X_RANGES, xToStagePosition } from '../../utils/curve'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'

interface Props {
  entry: Entry
  labelPos: LabelPosition
  svgRef: React.RefObject<SVGSVGElement | null>
  onPositionChange: (id: string, position: number) => void
}

const ICON_SIZE = 12
const PLATEAU_STAGE = 'plateau_of_productivity'

export function EntryLabel({ entry, labelPos, svgRef, onPositionChange }: Props) {
  const draggingRef = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  function getSVGX(clientX: number): number {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    return ((clientX - rect.left) / rect.width) * viewBox.width
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    draggingRef.current = true
    setIsDragging(true)
    const [xStart, xEnd] = STAGE_X_RANGES[entry.stage]

    const onMove = (me: MouseEvent) => {
      if (!draggingRef.current) return
      const rawX = getSVGX(me.clientX)
      const clampedX = Math.max(xStart, Math.min(xEnd, rawX))
      onPositionChange(entry.id, xToStagePosition(entry.stage, clampedX))
    }

    const onUp = () => {
      draggingRef.current = false
      setIsDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const { cx, cy, ly, displaced } = labelPos
  const isPlateauStage = entry.stage === PLATEAU_STAGE
  const textX = isPlateauStage ? cx - ICON_SIZE / 2 - 4 : cx + ICON_SIZE / 2 + 4
  const textAnchor = isPlateauStage ? 'end' : 'start'
  const cursor = isDragging ? 'grabbing' : hovered ? 'grab' : 'default'

  return (
    <g
      style={{ cursor }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Spike line: only when label is displaced */}
      {displaced && (
        <line
          x1={cx} y1={cy} x2={cx} y2={ly}
          stroke="#bbb" strokeWidth={0.8} strokeDasharray="3,2"
          pointerEvents="none"
        />
      )}

      {/* Hover highlight ring — rendered before icon so it appears behind */}
      {hovered && (
        <circle
          cx={cx} cy={cy}
          r={ICON_SIZE / 2 + 5}
          fill="#f0f4ff"
          stroke="#93c5fd"
          strokeWidth={1}
          pointerEvents="none"
        />
      )}

      {/* Time-to-adoption icon on the curve */}
      <g transform={`translate(${cx}, ${cy})`}>
        <TimeToAdoptionIcon type={entry.timeToAdoption} size={ICON_SIZE} />
      </g>

      {/* Keyword label — interactive: receives pointer events for dragging */}
      <text
        x={textX}
        y={ly + 4}
        fontSize={12}
        textAnchor={textAnchor}
        fill={hovered ? '#111827' : '#374151'}
        fontWeight={hovered ? '600' : '400'}
        style={{ userSelect: 'none' }}
      >
        {entry.keyword}
      </text>
    </g>
  )
}

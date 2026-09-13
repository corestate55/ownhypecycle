import type { Entry } from '../../types'
import { STAGE_LABELS, STAGES } from '../../types'
import {
  VIEW_WIDTH, VIEW_HEIGHT,
  buildCurvePath,
  STAGE_BOUNDARIES,
  STAGE_X_RANGES,
  stageLabelX,
} from '../../utils/curve'
import { computeLabelPositions } from '../../utils/labelLayout'
import { EntryLabel } from './EntryLabel'
import { Legend } from './Legend'

interface Props {
  entries: Entry[]
  onPositionChange: (id: string, position: number) => void
  svgRef: React.RefObject<SVGSVGElement | null>
}

const CHART_TOP = 20
const CHART_BOTTOM = 450
const AXIS_Y = CHART_BOTTOM

export function HypeCycleChart({ entries, onPositionChange, svgRef }: Props) {
  const curvePath = buildCurvePath()
  const labelPositions = computeLabelPositions(entries)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', background: '#fff', fontFamily: 'sans-serif' }}
    >
      {/* Y axis */}
      <line x1={25} y1={CHART_TOP} x2={25} y2={AXIS_Y} stroke="#ccc" strokeWidth={1} />
      <text
        x={13} y={(CHART_TOP + AXIS_Y) / 2}
        fontSize={11} fill="#999"
        textAnchor="middle"
        transform={`rotate(-90, 13, ${(CHART_TOP + AXIS_Y) / 2})`}
      >
        期待値
      </text>

      {/* X axis */}
      <line x1={25} y1={AXIS_Y} x2={VIEW_WIDTH - 10} y2={AXIS_Y} stroke="#ccc" strokeWidth={1} />
      <text x={(VIEW_WIDTH - 10 + 25) / 2} y={VIEW_HEIGHT - 30} fontSize={11} fill="#999" textAnchor="middle">
        時間
      </text>

      {/* Phase dividers and labels */}
      {STAGE_BOUNDARIES.map((x) => (
        <line key={x} x1={x} y1={CHART_TOP} x2={x} y2={AXIS_Y}
          stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4,3" />
      ))}
      {STAGES.map((stage) => {
        const [xStart, xEnd] = STAGE_X_RANGES[stage]
        const labelX = stageLabelX(stage)
        return (
          <g key={stage}>
            <rect
              x={xStart} y={CHART_TOP}
              width={xEnd - xStart} height={AXIS_Y - CHART_TOP}
              fill="transparent"
            />
            <text
              x={labelX} y={AXIS_Y - 6}
              fontSize={10} fill="#888"
              textAnchor="middle"
            >
              {STAGE_LABELS[stage]}
            </text>
          </g>
        )
      })}

      {/* Hype Cycle curve */}
      <path
        d={curvePath}
        fill="none"
        stroke="#2563eb"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Entry labels */}
      {entries.map((entry) => {
        const lp = labelPositions.find((p) => p.id === entry.id)
        if (!lp) return null
        return (
          <EntryLabel
            key={entry.id}
            entry={entry}
            labelPos={lp}
            svgRef={svgRef}
            onPositionChange={onPositionChange}
          />
        )
      })}

      {/* Legend */}
      <Legend />
    </svg>
  )
}

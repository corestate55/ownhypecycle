import { TIME_LABELS, TIME_TO_ADOPTIONS } from '../../types'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'
import { VIEW_WIDTH } from '../../utils/curve'

const LEGEND_X = VIEW_WIDTH - 130
const LEGEND_Y = 25
const ROW_HEIGHT = 22

export function Legend() {
  return (
    <g transform={`translate(${LEGEND_X}, ${LEGEND_Y})`}>
      {/* Background */}
      <rect
        x={-8} y={-14}
        width={122} height={TIME_TO_ADOPTIONS.length * ROW_HEIGHT + 8}
        fill="white" fillOpacity={0.88}
        stroke="#e5e7eb" strokeWidth={1}
        rx={4}
      />
      <text fontSize={10} fill="#666" fontWeight="bold" y={0}>実現時期</text>
      {TIME_TO_ADOPTIONS.map((t, i) => (
        <g key={t} transform={`translate(0, ${(i + 1) * ROW_HEIGHT})`}>
          <TimeToAdoptionIcon type={t} size={10} />
          <text x={12} y={4} fontSize={11} fill="#444">{TIME_LABELS[t]}</text>
        </g>
      ))}
    </g>
  )
}

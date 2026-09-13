import { TIME_LABELS, TIME_TO_ADOPTIONS } from '../../types'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'
import { VIEW_WIDTH } from '../../utils/curve'

const PADDING = 10
const TITLE_HEIGHT = 18
const ROW_HEIGHT = 22
const BOX_WIDTH = 128
const BOX_HEIGHT = PADDING + TITLE_HEIGHT + TIME_TO_ADOPTIONS.length * ROW_HEIGHT + PADDING

const LEGEND_X = VIEW_WIDTH - BOX_WIDTH - PADDING
const LEGEND_Y = 25

export function Legend() {
  return (
    <g transform={`translate(${LEGEND_X}, ${LEGEND_Y})`}>
      <rect
        x={-PADDING} y={-PADDING}
        width={BOX_WIDTH} height={BOX_HEIGHT}
        fill="white" fillOpacity={0.92}
        stroke="#d1d5db" strokeWidth={1}
        rx={4}
      />
      <text fontSize={10} fill="#555" fontWeight="bold" y={0}>実現時期</text>
      {TIME_TO_ADOPTIONS.map((t, i) => (
        <g key={t} transform={`translate(6, ${TITLE_HEIGHT + (i + 0.5) * ROW_HEIGHT})`}>
          <TimeToAdoptionIcon type={t} size={10} />
          <text x={10} y={4} fontSize={11} fill="#333">{TIME_LABELS[t]}</text>
        </g>
      ))}
    </g>
  )
}

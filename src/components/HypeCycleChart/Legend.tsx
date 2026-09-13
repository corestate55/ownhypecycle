import { TIME_LABELS, TIME_TO_ADOPTIONS } from '../../types'
import { TimeToAdoptionIcon } from './TimeToAdoptionIcon'

export function Legend() {
  return (
    <g transform="translate(20, 460)">
      <text fontSize={10} fill="#666" fontWeight="bold">実現時期:</text>
      {TIME_TO_ADOPTIONS.map((t, i) => (
        <g key={t} transform={`translate(${70 + i * 110}, 0)`}>
          <TimeToAdoptionIcon type={t} size={10} />
          <text x={9} y={4} fontSize={10} fill="#555">{TIME_LABELS[t]}</text>
        </g>
      ))}
    </g>
  )
}

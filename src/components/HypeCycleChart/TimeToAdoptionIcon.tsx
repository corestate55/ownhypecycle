import type { TimeToAdoption } from '../../types'

interface Props {
  type: TimeToAdoption
  size?: number
}

export function TimeToAdoptionIcon({ type, size = 10 }: Props) {
  const r = size / 2
  switch (type) {
    case 'lt2':
      return <circle r={r} fill="white" stroke="#333" strokeWidth={1.5} />
    case '2to5':
      return <circle r={r} fill="#4A90D9" />
    case '5to10':
      return <circle r={r} fill="#1A3A6B" />
    case 'gt10': {
      const h = size * 0.866
      const points = `0,${-h * 0.67} ${r},${h * 0.33} ${-r},${h * 0.33}`
      return <polygon points={points} fill="#D94A4A" />
    }
    case 'obsolete':
      return (
        <g>
          <circle r={r} fill="white" stroke="#D94A4A" strokeWidth={1.5} />
          <line x1={-r * 0.6} y1={-r * 0.6} x2={r * 0.6} y2={r * 0.6} stroke="#D94A4A" strokeWidth={1.5} />
          <line x1={r * 0.6} y1={-r * 0.6} x2={-r * 0.6} y2={r * 0.6} stroke="#D94A4A" strokeWidth={1.5} />
        </g>
      )
  }
}

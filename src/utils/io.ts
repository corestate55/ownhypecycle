import { v4 as uuidv4 } from 'uuid'
import type { Entry, Stage, TimeToAdoption } from '../types'
import { STAGES, TIME_TO_ADOPTIONS } from '../types'

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(entries: Entry[]) {
  const header = 'keyword,timeToAdoption,stage,position'
  const rows = entries.map(
    (e) => `${csvEscape(e.keyword)},${e.timeToAdoption},${e.stage},${e.position}`,
  )
  downloadBlob([header, ...rows].join('\n'), 'hypecycle.csv', 'text/csv')
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportJSON(entries: Entry[]) {
  const data = entries.map(({ id: _id, ...rest }) => rest)
  downloadBlob(JSON.stringify(data, null, 2), 'hypecycle.json', 'application/json')
}

export function exportSVG(svgElement: SVGSVGElement) {
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgElement)
  downloadBlob(svgStr, 'hypecycle.svg', 'image/svg+xml')
}

function isValidStage(v: unknown): v is Stage {
  return STAGES.includes(v as Stage)
}

function isValidTime(v: unknown): v is TimeToAdoption {
  return TIME_TO_ADOPTIONS.includes(v as TimeToAdoption)
}

function parsePosition(v: unknown): number {
  const n = Number(v)
  return isNaN(n) ? 0.5 : Math.max(0, Math.min(1, n))
}

export function parseCSV(text: string): Entry[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  return lines.slice(1).flatMap((line) => {
    const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g)
    if (!parts || parts.length < 4) return []
    const keyword = parts[0].replace(/^"|"$/g, '').replace(/""/g, '"')
    const timeToAdoption = parts[1].trim()
    const stage = parts[2].trim()
    const position = parts[3].trim()
    if (!isValidTime(timeToAdoption) || !isValidStage(stage)) return []
    return [{ id: uuidv4(), keyword, timeToAdoption, stage, position: parsePosition(position) }]
  })
}

export function parseJSON(text: string): Entry[] {
  try {
    const data = JSON.parse(text)
    if (!Array.isArray(data)) return []
    return data.flatMap((item) => {
      if (typeof item.keyword !== 'string') return []
      if (!isValidTime(item.timeToAdoption)) return []
      if (!isValidStage(item.stage)) return []
      return [{
        id: uuidv4(),
        keyword: item.keyword,
        timeToAdoption: item.timeToAdoption,
        stage: item.stage,
        position: parsePosition(item.position),
      }]
    })
  } catch {
    return []
  }
}

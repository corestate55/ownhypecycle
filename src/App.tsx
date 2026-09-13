import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { HypeCycleChart } from './components/HypeCycleChart'
import { DataTable } from './components/DataTable'
import { TableToolbar } from './components/TableToolbar'
import { exportSVG } from './utils/io'
import type { Entry } from './types'

const SAMPLE_ENTRIES: Entry[] = [
  { id: uuidv4(), keyword: 'Generative AI', timeToAdoption: 'lt2', stage: 'peak_of_expectations', position: 0.5 },
  { id: uuidv4(), keyword: 'Quantum Computing', timeToAdoption: 'gt10', stage: 'innovation_trigger', position: 0.7 },
  { id: uuidv4(), keyword: 'Metaverse', timeToAdoption: 'obsolete', stage: 'trough_of_disillusionment', position: 0.4 },
  { id: uuidv4(), keyword: 'Digital Twin', timeToAdoption: '2to5', stage: 'slope_of_enlightenment', position: 0.4 },
  { id: uuidv4(), keyword: 'Edge AI', timeToAdoption: '5to10', stage: 'plateau_of_productivity', position: 0.5 },
]

function newEntry(): Entry {
  return {
    id: uuidv4(),
    keyword: '',
    timeToAdoption: '2to5',
    stage: 'innovation_trigger',
    position: 0.5,
  }
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>(SAMPLE_ENTRIES)
  const svgRef = useRef<SVGSVGElement>(null)

  function handleUpdate(id: string, field: keyof Entry, value: string | number) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    )
  }

  function handlePositionChange(id: string, position: number) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, position } : e)),
    )
  }

  function handleAdd() {
    setEntries((prev) => [...prev, newEntry()])
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function handleImport(imported: Entry[]) {
    setEntries(imported)
  }

  function handleExportSVG() {
    if (svgRef.current) exportSVG(svgRef.current)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-lg font-bold text-gray-800">OwnHypeCycle</h1>
        <button
          onClick={handleExportSVG}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          SVG ダウンロード
        </button>
      </header>

      {/* Chart area — aspect-ratio 2:1, scrollable if viewport is narrow */}
      <div className="shrink-0 border-b border-gray-200 p-2 overflow-hidden" style={{ maxHeight: '60vh' }}>
        <HypeCycleChart
          entries={entries}
          onPositionChange={handlePositionChange}
          svgRef={svgRef}
        />
      </div>

      {/* Table area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TableToolbar entries={entries} onAdd={handleAdd} onImport={handleImport} />
        <div className="flex-1 overflow-auto">
          <DataTable entries={entries} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

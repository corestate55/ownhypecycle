import { useRef } from 'react'
import type { Entry } from '../types'
import { exportCSV, exportJSON, parseCSV, parseJSON } from '../utils/io'

interface Props {
  entries: Entry[]
  onAdd: () => void
  onImport: (entries: Entry[]) => void
}

export function TableToolbar({ entries, onAdd, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = file.name.endsWith('.json') ? parseJSON(text) : parseCSV(text)
      if (parsed.length > 0) {
        onImport(parsed)
      } else {
        alert('インポートに失敗しました。ファイル形式を確認してください。')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
      <button
        onClick={onAdd}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      >
        ＋ 行を追加
      </button>

      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">エクスポート:</span>
        <button
          onClick={() => exportCSV(entries)}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          CSV
        </button>
        <button
          onClick={() => exportJSON(entries)}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          JSON
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">インポート:</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          CSV / JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { Entry } from '../../types'
import { STAGE_LABELS, STAGES, TIME_LABELS, TIME_TO_ADOPTIONS } from '../../types'
import { TimeToAdoptionIcon } from '../HypeCycleChart/TimeToAdoptionIcon'

interface Props {
  entries: Entry[]
  onUpdate: (id: string, field: keyof Entry, value: string | number) => void
  onDelete: (id: string) => void
}

interface EditingCell {
  id: string
  field: keyof Entry
}

export function DataTable({ entries, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<EditingCell | null>(null)

  function startEdit(id: string, field: keyof Entry) {
    if (field === 'id') return
    setEditing({ id, field })
  }

  function commitEdit(e: React.FocusEvent | React.KeyboardEvent) {
    if ('key' in e && e.key !== 'Enter') return
    setEditing(null)
  }

  function handlePositionChange(id: string, raw: string) {
    const n = parseFloat(raw)
    if (!isNaN(n)) onUpdate(id, 'position', Math.max(0, Math.min(1, n)))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-3 py-2 text-left border border-gray-200 w-48">キーワード</th>
            <th className="px-3 py-2 text-left border border-gray-200 w-36">実現時期</th>
            <th className="px-3 py-2 text-left border border-gray-200 w-36">フェーズ</th>
            <th className="px-3 py-2 text-left border border-gray-200 w-28">位置 [0,1]</th>
            <th className="px-3 py-2 border border-gray-200 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-blue-50 transition-colors">
              {/* Keyword */}
              <td
                className="px-3 py-1 border border-gray-200 cursor-text"
                onClick={() => startEdit(entry.id, 'keyword')}
              >
                {editing?.id === entry.id && editing.field === 'keyword' ? (
                  <input
                    autoFocus
                    className="w-full outline-none border-b border-blue-400"
                    defaultValue={entry.keyword}
                    onBlur={(e) => {
                      onUpdate(entry.id, 'keyword', e.target.value)
                      commitEdit(e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdate(entry.id, 'keyword', e.currentTarget.value)
                        commitEdit(e)
                      }
                    }}
                  />
                ) : (
                  <span>{entry.keyword || <span className="text-gray-400 italic">クリックして入力</span>}</span>
                )}
              </td>

              {/* Time to adoption */}
              <td className="px-3 py-1 border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg width={12} height={12} viewBox="-6 -6 12 12" overflow="visible">
                    <TimeToAdoptionIcon type={entry.timeToAdoption} size={10} />
                  </svg>
                  <select
                    className="bg-transparent outline-none cursor-pointer text-sm"
                    value={entry.timeToAdoption}
                    onChange={(e) => onUpdate(entry.id, 'timeToAdoption', e.target.value)}
                  >
                    {TIME_TO_ADOPTIONS.map((t) => (
                      <option key={t} value={t}>{TIME_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </td>

              {/* Stage */}
              <td className="px-3 py-1 border border-gray-200">
                <select
                  className="bg-transparent outline-none cursor-pointer text-sm w-full"
                  value={entry.stage}
                  onChange={(e) => onUpdate(entry.id, 'stage', e.target.value)}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                  ))}
                </select>
              </td>

              {/* Position */}
              <td
                className="px-3 py-1 border border-gray-200 cursor-text"
                onClick={() => startEdit(entry.id, 'position')}
              >
                {editing?.id === entry.id && editing.field === 'position' ? (
                  <input
                    autoFocus
                    type="number"
                    min={0} max={1} step={0.01}
                    className="w-full outline-none border-b border-blue-400"
                    defaultValue={entry.position}
                    onBlur={(e) => {
                      handlePositionChange(entry.id, e.target.value)
                      commitEdit(e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePositionChange(entry.id, e.currentTarget.value)
                        commitEdit(e)
                      }
                    }}
                  />
                ) : (
                  <span>{entry.position.toFixed(2)}</span>
                )}
              </td>

              {/* Delete */}
              <td className="px-2 py-1 border border-gray-200 text-center">
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  title="削除"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-gray-400 border border-gray-200">
                行を追加してください
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

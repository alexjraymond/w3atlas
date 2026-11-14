import { useEffect, useRef, useState, type RefObject } from 'react'
import { CloseButton } from '@mantine/core'
import { IconGripVertical } from '@tabler/icons-react'
import type { MapNote } from '../types'

interface Props {
  note: MapNote
  container: RefObject<HTMLDivElement | null>
  readOnly?: boolean
  onChange: (note: MapNote) => void
  onDelete: () => void
}

/** A draggable, editable note pinned to a percentage position on the map. */
export function StickyNote({ note, container, readOnly, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(!note.text && !readOnly)
  const [draft, setDraft] = useState(note.text)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => setDraft(note.text), [note.text])
  useEffect(() => {
    if (editing) areaRef.current?.focus()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== note.text) onChange({ ...note, text: draft })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (readOnly) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setDrag({ x: note.x, y: note.y })
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !container.current) return
    const r = container.current.getBoundingClientRect()
    const x = Math.min(98, Math.max(2, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.min(98, Math.max(2, ((e.clientY - r.top) / r.height) * 100))
    setDrag({ x, y })
  }
  const onPointerUp = () => {
    if (drag) onChange({ ...note, x: drag.x, y: drag.y })
    setDrag(null)
  }

  const pos = drag ?? note
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 6,
        background: '#fff3a3',
        color: '#222',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,.5)',
        maxWidth: 170,
        minWidth: 90,
        fontSize: 12,
        lineHeight: 1.3,
      }}
    >
      {!readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1px 2px 0' }}>
          <span
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ cursor: drag ? 'grabbing' : 'grab', touchAction: 'none', display: 'flex', color: '#8a7a2a' }}
            aria-label="Drag note"
          >
            <IconGripVertical size={14} />
          </span>
          <CloseButton size="xs" c="#8a7a2a" aria-label="Delete note" onClick={onDelete} />
        </div>
      )}
      {editing ? (
        <textarea
          ref={areaRef}
          value={draft}
          rows={3}
          placeholder="Note…"
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(note.text)
              setEditing(false)
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit()
          }}
          style={{
            width: 160,
            border: 0,
            outline: 0,
            resize: 'none',
            background: 'transparent',
            font: 'inherit',
            color: 'inherit',
            padding: '2px 6px 6px',
          }}
        />
      ) : (
        <div
          onClick={() => !readOnly && setEditing(true)}
          style={{
            padding: readOnly ? '6px 8px' : '0 8px 6px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: readOnly ? 'default' : 'text',
          }}
        >
          {note.text || <i style={{ opacity: 0.6 }}>Empty note</i>}
        </div>
      )}
    </div>
  )
}

import { useRef } from 'react'
import { HoverCard } from '@mantine/core'
import type { GameMap, MapNote, RouteStep } from '../types'
import { DIFFICULTY_COLOR } from '../data/maps'
import { CampDetails } from './CampDetails'
import { StickyNote } from './StickyNote'
import classes from './MapCanvas.module.css'

interface Props {
  map: GameMap
  steps?: RouteStep[]
  activeStepId?: string | null
  onCampClick?: (campId: string) => void
  notes?: MapNote[]
  placingNote?: boolean
  onAddNote?: (x: number, y: number) => void
  onChangeNote?: (note: MapNote) => void
  onDeleteNote?: (id: string) => void
  readOnly?: boolean
}

export function MapCanvas({
  map,
  steps = [],
  activeStepId,
  onCampClick,
  notes = [],
  placingNote,
  onAddNote,
  onChangeNote,
  onDeleteNote,
  readOnly,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const orderOf = new Map(steps.map((s, i) => [s.campId, i + 1]))
  const activeCamp = steps.find((s) => s.id === activeStepId)?.campId
  const points = steps
    .map((s) => map.camps.find((c) => c.id === s.campId)?.position)
    .filter((p): p is { x: number; y: number } => !!p)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingNote || !onAddNote || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    onAddNote(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <div
      ref={ref}
      className={classes.canvas}
      style={{ aspectRatio: `${map.width} / ${map.height}`, cursor: placingNote ? 'crosshair' : undefined }}
      onClick={handleClick}
    >
      <img src={map.image} alt={map.name} className={classes.image} draggable={false} />

      {/* route path */}
      <svg className={classes.path} viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio='none'>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth={map.width / 40} markerHeight={map.width / 40} orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#ffd43b" />
          </marker>
        </defs>
        {points.slice(1).map((p, i) => {
          const a = points[i]
          const mx = (a.x + p.x) / 2
          const my = (a.y + p.y) / 2
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.lineShadow} />
              <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.line} />
              {/* arrowhead at midpoint so it isn't hidden under the marker */}
              <line x1={a.x} y1={a.y} x2={mx} y2={my} stroke="transparent" markerEnd="url(#arrow)" strokeWidth={6} />
            </g>
          )
        })}
      </svg>

      {map.camps.map((camp) => {
        const order = orderOf.get(camp.id)
        const left = (camp.position.x / map.width) * 100
        const top = (camp.position.y / map.height) * 100
        return (
          <HoverCard
            key={camp.id}
            position="top"
            withArrow
            shadow="xl"
            openDelay={80}
            closeDelay={60}
            disabled={placingNote}
          >
            <HoverCard.Target>
              <button
                type="button"
                aria-label={`${camp.name}${order ? `, step ${order}` : ''}`}
                className={classes.camp}
                data-selected={order ? true : undefined}
                data-active={activeCamp === camp.id || undefined}
                data-readonly={readOnly || undefined}
                style={{ left: `${left}%`, top: `${top}%`, ['--camp-color' as string]: DIFFICULTY_COLOR[camp.difficulty] }}
                onClick={(e) => {
                  if (placingNote) return // let the click bubble to place a note
                  e.stopPropagation()
                  if (!readOnly) onCampClick?.(camp.id)
                }}
              >
                {order ?? ''}
              </button>
            </HoverCard.Target>
            <HoverCard.Dropdown style={{ pointerEvents: 'none' }}>
              <CampDetails camp={camp} />
            </HoverCard.Dropdown>
          </HoverCard>
        )
      })}

      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          container={ref}
          readOnly={readOnly}
          onChange={(n) => onChangeNote?.(n)}
          onDelete={() => onDeleteNote?.(note.id)}
        />
      ))}
    </div>
  )
}

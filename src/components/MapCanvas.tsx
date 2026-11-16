import { useRef } from 'react'
import { HoverCard } from '@mantine/core'
import { IconMapPinFilled } from '@tabler/icons-react'
import type { GameMap, MapNote, RouteStep } from '../types'
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../data/maps'
import { stepPosition } from '../game/route'
import { CampDetails } from './CampDetails'
import { StickyNote } from './StickyNote'
import classes from './MapCanvas.module.css'

interface Props {
  map: GameMap
  steps?: RouteStep[]
  activeStepId?: string | null
  onCampClick?: (campId: string) => void
  onStepClick?: (stepId: string) => void
  notes?: MapNote[]
  /** when set, the next click on the map reports its position (in map pixels) */
  placing?: 'note' | 'waypoint' | null
  onPlace?: (x: number, y: number) => void
  onChangeNote?: (note: MapNote) => void
  onDeleteNote?: (id: string) => void
  readOnly?: boolean
  showLegend?: boolean
  /** race helper unit (Militia / Ancient of War / Ghoul): shown as a badge on camps that use it */
  helper?: { name: string; icon: string; counted: boolean }
}

export function MapCanvas({
  map,
  steps = [],
  activeStepId,
  onCampClick,
  onStepClick,
  notes = [],
  placing,
  onPlace,
  onChangeNote,
  onDeleteNote,
  readOnly,
  showLegend = true,
  helper,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // the Ancient of War walks between the camps it is brought to, in route order
  const aow =
    helper?.name === 'Ancient of War'
      ? steps.filter((s) => s.helpers[helper.name]).map((s) => stepPosition(map, s)).filter((p): p is { x: number; y: number } => !!p)
      : []


  const orderOf = new Map<string, number>()
  steps.forEach((s, i) => s.campId && !orderOf.has(s.campId) && orderOf.set(s.campId, i + 1))
  const activeCamp = steps.find((s) => s.id === activeStepId)?.campId
  /** campId -> how many helper units are brought there */
  const helped = new Map<string, number>()
  if (helper) steps.forEach((s) => s.campId && s.helpers[helper.name] && helped.set(s.campId, s.helpers[helper.name]))
  const points = steps.map((s) => stepPosition(map, s)).filter((p): p is { x: number; y: number } => !!p)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing || !onPlace || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    onPlace(((e.clientX - rect.left) / rect.width) * map.width, ((e.clientY - rect.top) / rect.height) * map.height)
  }

  return (
    <div>
      <div
        ref={ref}
        className={classes.canvas}
        style={{ aspectRatio: `${map.width} / ${map.height}`, cursor: placing ? 'crosshair' : undefined }}
        onClick={handleClick}
      >
        <img src={map.image} alt={map.name} className={classes.image} draggable={false} />

        <svg className={classes.path} viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="none">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth={map.width / 40}
              markerHeight={map.width / 40}
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#ffd43b" />
            </marker>
            <marker
              id="aowArrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth={map.width / 50}
              markerHeight={map.width / 50}
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#8ce99a" />
            </marker>
          </defs>
          {points.slice(1).map((p, i) => {
            const a = points[i]
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.lineShadow} />
                <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.line} />
                {/* arrowhead at the midpoint so it isn't hidden under a marker */}
                <line x1={a.x} y1={a.y} x2={(a.x + p.x) / 2} y2={(a.y + p.y) / 2} stroke="transparent" markerEnd="url(#arrow)" />
              </g>
            )
          })}
          {aow.slice(1).map((p, i) => {
            const a = aow[i]
            return (
              <g key={`aow${i}`}>
                <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.lineShadow} />
                <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} className={classes.aowLine} />
                <line x1={a.x} y1={a.y} x2={(a.x + p.x) / 2} y2={(a.y + p.y) / 2} stroke="transparent" markerEnd="url(#aowArrow)" />
              </g>
            )
          })}
        </svg>

        {map.camps.map((camp) => {
          const order = orderOf.get(camp.id)
          return (
            <HoverCard key={camp.id} position="top" withArrow shadow="xl" openDelay={80} closeDelay={180} disabled={!!placing}>
              <HoverCard.Target>
                <button
                  type="button"
                  aria-label={`${camp.title}, ${camp.name}${order ? `, step ${order}` : ''}`}
                  className={classes.camp}
                  data-selected={order ? true : undefined}
                  data-active={activeCamp === camp.id || undefined}
                  data-helped={(helper && helped.has(camp.id)) || undefined}
                  data-readonly={readOnly || undefined}
                  style={{
                    left: `${(camp.position.x / map.width) * 100}%`,
                    top: `${(camp.position.y / map.height) * 100}%`,
                    ['--camp-color' as string]: DIFFICULTY_COLOR[camp.difficulty],
                  }}
                  onClick={(e) => {
                    if (placing) return // let the click reach the map to place something
                    e.stopPropagation()
                    if (!readOnly) onCampClick?.(camp.id)
                    else {
                      const step = steps.find((s) => s.campId === camp.id)
                      if (step) onStepClick?.(step.id)
                    }
                  }}
                >
                  {helper && helped.has(camp.id) && (
                    <img
                      className={classes.helperFill}
                      src={`${import.meta.env.BASE_URL}icons/${helper.icon}.png`}
                      alt=""
                      title={`With ${helper.counted ? `${helped.get(camp.id)} ` : ''}${helper.name}`}
                    />
                  )}
                  <span className={classes.campNum}>{order ?? ''}</span>
                  {helper?.counted && helped.has(camp.id) && (
                    <span className={classes.helperCount} aria-label={`${helped.get(camp.id)} ${helper.name}`}>
                      {helped.get(camp.id)}
                    </span>
                  )}
                </button>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <CampDetails camp={camp} />
              </HoverCard.Dropdown>
            </HoverCard>
          )
        })}

        {steps.map((s, i) =>
          s.kind === 'waypoint' && s.point ? (
            <button
              key={s.id}
              type="button"
              className={classes.waypoint}
              data-active={activeStepId === s.id || undefined}
              title={s.label || 'Waypoint'}
              aria-label={`Waypoint ${i + 1}${s.label ? `: ${s.label}` : ''}`}
              style={{ left: `${(s.point.x / map.width) * 100}%`, top: `${(s.point.y / map.height) * 100}%` }}
              onClick={(e) => {
                if (placing) return
                e.stopPropagation()
                onStepClick?.(s.id)
              }}
            >
              <IconMapPinFilled className={classes.pin} />
              <span>{i + 1}</span>
            </button>
          ) : null,
        )}

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
      {showLegend && (
        <div className={classes.legend}>
          {(['green', 'orange', 'red'] as const).map((d) => (
            <span key={d}>
              <i style={{ background: DIFFICULTY_COLOR[d] }} />
              {DIFFICULTY_LABEL[d]}
            </span>
          ))}
          <span>
            <IconMapPinFilled size={14} color="#8ec9f2" stroke="#1d2b1f" strokeWidth={1.5} /> Waypoint
          </span>
          {steps.length > 1 && (
            <span>
              <i style={{ background: '#ffd43b', borderRadius: 0, width: 16, height: 5 }} /> Hero path
            </span>
          )}
          {aow.length > 1 && (
            <span>
              <i style={{ background: '#8ce99a', borderRadius: 0, width: 16, height: 5 }} /> Ancient of War path
            </span>
          )}
        </div>
      )}
    </div>
  )
}

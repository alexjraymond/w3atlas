import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronsUp,
  IconGripVertical,
  IconMapPinFilled,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import type { GameMap, Route, RouteStep } from '../types'
import { campInstances, DIFFICULTY_LABEL, LOOT_COLOR, LOOT_LABEL } from '../data/maps'
import { simulateRoute, type StepResult } from '../game/route'
import { HERO_BY_NAME } from '../game/heroes'
import { DifficultyDot } from './CampDetails'
import { KillOrder, KillOrderStrip } from './KillOrder'
import { BringUnits } from './BringUnits'
import { GameIcon } from './GameIcon'

export function XpSummary({ map, route }: { map: GameMap; route: Route }) {
  const { final } = simulateRoute(map, route.steps)
  const capped = final.level >= 5
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" align="baseline">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Hero level after route
        </Text>
        <Text size="xs" c="dimmed" ff="monospace">
          {Math.round(final.xp)} xp
        </Text>
      </Group>
      <Group gap="xs" align="baseline" mt={2}>
        <Text fz={28} fw={800} lh={1}>
          {final.exact.toFixed(2)}
        </Text>
        <Text size="xs" c={capped ? 'orange' : 'dimmed'}>
          {capped ? 'Level 5+: creeps no longer give XP' : `${Math.round(final.intoLevel)} / ${final.levelSpan} to level ${final.level + 1}`}
        </Text>
      </Group>
      <Progress value={final.progress * 100} mt={8} size="sm" color={capped ? 'orange' : 'yellow'} />
    </Card>
  )
}

function SkillsLearned({ route, levels }: { route: Route; levels: number[] }) {
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  if (!hero || !levels.length) return null
  return (
    <Group gap={2}>
      {levels.map((lvl) => {
        const ability = hero.abilities.find((a) => a.name === route.skills[lvl - 1])
        return ability ? (
          <Tooltip key={lvl} label={`Level ${lvl}: learn ${ability.name}`}>
            <span style={{ display: 'flex' }}>
              <GameIcon name={ability.icon} size={18} />
            </span>
          </Tooltip>
        ) : null
      })}
    </Group>
  )
}

interface StepProps {
  route: Route
  result: StepResult
  count: number
  open: boolean
  active: boolean
  readOnly?: boolean
  dragOver: boolean
  onOpen: (open: boolean) => void
  onHover: () => void
  onChange: (s: RouteStep) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}

function StepCard(p: StepProps) {
  const { route, result, readOnly } = p
  const { step, index, camp } = result
  const [showCondition, setShowCondition] = useState(!!step.condition)
  const isWaypoint = step.kind === 'waypoint'
  if (!isWaypoint && !camp) return null

  const skipped = camp && step.rest === 'skip' ? campInstances(camp).filter((c) => !step.groups.flat().includes(c.uid)) : []

  const title = isWaypoint ? step.label || 'Waypoint' : camp!.title
  const subtitle = isWaypoint ? 'Waypoint' : `${DIFFICULTY_LABEL[camp!.difficulty]} · Lv ${camp!.level} · ${camp!.name}`

  return (
    <Card
      withBorder
      padding={0}
      onMouseEnter={p.onHover}
      onDragOver={(e) => {
        e.preventDefault()
        p.onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        p.onDrop()
      }}
      style={{
        borderColor: p.dragOver ? 'var(--mantine-color-yellow-5)' : p.active ? 'var(--mantine-color-yellow-8)' : undefined,
        background: p.open ? 'var(--mantine-color-dark-6)' : undefined,
      }}
    >
      <Group wrap="nowrap" gap={8} p={8} align="flex-start">
        {!readOnly && (
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              p.onDragStart()
            }}
            onDragEnd={p.onDragEnd}
            style={{ cursor: 'grab', color: 'var(--mantine-color-dark-2)', paddingTop: 3, display: 'flex' }}
            aria-label="Drag to reorder"
          >
            <IconGripVertical size={16} />
          </span>
        )}
        <Text fw={700} c="yellow.5" w={18} ta="right" mt={1}>
          {index + 1}
        </Text>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <UnstyledButton onClick={() => p.onOpen(!p.open)} style={{ width: '100%' }}>
            <Group justify="space-between" wrap="nowrap" gap={8} align="flex-start">
              <Group gap={6} wrap="wrap" style={{ minWidth: 0 }} align="baseline">
                {isWaypoint ? <IconMapPinFilled size={13} color="#4dabf7" /> : <DifficultyDot camp={camp!} />}
                <Text fw={700} size="sm">
                  {title}
                </Text>
                <Text size="xs" c="dimmed">
                  {subtitle}
                </Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                {result.levelUps.length > 0 && <IconChevronsUp size={14} color="var(--mantine-color-yellow-5)" />}
                <Text size="xs" ff="monospace" c={result.levelUps.length ? 'yellow.4' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                  Lv {result.after.level} · {Math.round(result.after.xp)} xp
                </Text>
                <IconChevronDown size={14} style={{ transform: p.open ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' }} />
              </Group>
            </Group>
          </UnstyledButton>

          {!p.open && (
            <Group gap={8}>
              {camp && <KillOrderStrip groups={result.groups} skipped={skipped} />}
              {Object.entries(step.helpers).map(([n, c]) => (
                <Badge key={n} size="xs" variant="dot" color="cyan">
                  {c > 1 ? `${c}× ` : ''}
                  {n}
                </Badge>
              ))}
              {step.condition && (
                <Badge size="xs" variant="light" color="grape">
                  if {step.condition}
                </Badge>
              )}
            </Group>
          )}
          {!p.open && step.note && (
            <Text size="xs" c="gray.5" lineClamp={2}>
              {step.note}
            </Text>
          )}

          <Collapse in={p.open}>
            <Stack gap="sm" pt={4} pb={4}>
              {camp && (
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap={6}>
                    {result.drops.map((d, i) => (
                      <Badge key={i} size="xs" variant="light" color={LOOT_COLOR[d.type]}>
                        L{d.level} {LOOT_LABEL[d.type]} · {d.from}
                      </Badge>
                    ))}
                  </Group>
                  <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                    <Text fw={800} fz={20} lh={1}>
                      Lv {result.after.level}
                    </Text>
                    <Text size="xs" ff="monospace" c="dimmed">
                      {Math.round(result.after.xp)} / {result.after.level >= 10 ? '—' : Math.round(result.after.xp - result.after.intoLevel + result.after.levelSpan)} xp
                    </Text>
                    <Progress value={result.after.progress * 100} w={110} size={4} color="yellow" />
                    <SkillsLearned route={route} levels={result.levelUps} />
                  </Stack>
                </Group>
              )}

              {isWaypoint && !readOnly && (
                <TextInput
                  size="xs"
                  label="What happens here"
                  placeholder="e.g. Shop: buy TP + 2 potions, Tavern: 2nd hero"
                  value={step.label ?? ''}
                  onChange={(e) => p.onChange({ ...step, label: e.currentTarget.value })}
                />
              )}

              {camp && <KillOrder camp={camp} step={step} groups={result.groups} readOnly={readOnly} onChange={p.onChange} />}

              <BringUnits race={route.race} value={step.helpers} onChange={readOnly ? undefined : (helpers) => p.onChange({ ...step, helpers })} />

              {readOnly ? (
                <>
                  {step.condition && (
                    <Text size="sm">
                      <Text span c="grape.3" fw={600}>
                        Condition:
                      </Text>{' '}
                      {step.condition}
                    </Text>
                  )}
                  {step.note && (
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {step.note}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {showCondition ? (
                    <TextInput
                      size="xs"
                      label="Condition"
                      placeholder="e.g. only if no early harass / if night has fallen"
                      value={step.condition}
                      onChange={(e) => p.onChange({ ...step, condition: e.currentTarget.value })}
                    />
                  ) : (
                    <div>
                      <Button size="xs" variant="default" leftSection={<IconPlus size={14} />} onClick={() => setShowCondition(true)}>
                        Condition
                      </Button>
                    </div>
                  )}
                  <Textarea
                    size="xs"
                    autosize
                    minRows={2}
                    placeholder="What to do here and why (optional)"
                    value={step.note}
                    onChange={(e) => p.onChange({ ...step, note: e.currentTarget.value })}
                  />
                </>
              )}
            </Stack>
          </Collapse>
        </Stack>
        {!readOnly && (
          <Stack gap={0}>
            <ActionIcon size="sm" variant="subtle" color="gray" disabled={index === 0} onClick={() => p.onMove(-1)} aria-label="Move up">
              <IconArrowUp size={14} />
            </ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="gray" disabled={index === p.count - 1} onClick={() => p.onMove(1)} aria-label="Move down">
              <IconArrowDown size={14} />
            </ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="red" onClick={p.onRemove} aria-label="Remove step">
              <IconTrash size={14} />
            </ActionIcon>
          </Stack>
        )}
      </Group>
    </Card>
  )
}

interface Props {
  map: GameMap
  route: Route
  onStepsChange: (steps: RouteStep[]) => void
  activeStepId: string | null
  onActiveStep: (id: string | null) => void
  expanded: Set<string>
  onExpandedChange: (s: Set<string>) => void
  readOnly?: boolean
}

export function CreepRoute({ map, route, onStepsChange, activeStepId, onActiveStep, expanded, onExpandedChange, readOnly }: Props) {
  const { results } = simulateRoute(map, route.steps)
  const steps = route.steps
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  if (!steps.length) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="lg">
        {readOnly ? 'No creep route yet.' : 'Click camps on the map, in order, to build your route. Use Waypoint for shop or tavern stops.'}
      </Text>
    )
  }

  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= steps.length) return
    const next = [...steps]
    const [s] = next.splice(from, 1)
    next.splice(to, 0, s)
    onStepsChange(next)
  }

  return (
    <Stack gap={6} onMouseLeave={() => onActiveStep(null)}>
      {results.map((r, i) => (
        <StepCard
          key={r.step.id}
          route={route}
          result={r}
          count={steps.length}
          open={expanded.has(r.step.id)}
          active={activeStepId === r.step.id}
          readOnly={readOnly}
          dragOver={overId === r.step.id && dragId !== r.step.id}
          onOpen={(o) => {
            const next = new Set(expanded)
            if (o) next.add(r.step.id)
            else next.delete(r.step.id)
            onExpandedChange(next)
          }}
          onHover={() => onActiveStep(r.step.id)}
          onChange={(s) => onStepsChange(steps.map((x) => (x.id === s.id ? s : x)))}
          onMove={(dir) => moveTo(i, i + dir)}
          onRemove={() => onStepsChange(steps.filter((x) => x.id !== r.step.id))}
          onDragStart={() => setDragId(r.step.id)}
          onDragOver={() => setOverId(r.step.id)}
          onDrop={() => {
            if (dragId) moveTo(steps.findIndex((s) => s.id === dragId), i)
            setDragId(null)
            setOverId(null)
          }}
          onDragEnd={() => {
            setDragId(null)
            setOverId(null)
          }}
        />
      ))}
    </Stack>
  )
}

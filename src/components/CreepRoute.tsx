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
  IconMinus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import type { GameMap, Route, RouteStep } from '../types'
import { campInstances, DIFFICULTY_LABEL, LOOT_COLOR, LOOT_LABEL } from '../data/maps'
import { simulateRoute, type StepResult } from '../game/route'
import { CREEP_HELPER, HERO_BY_NAME } from '../game/heroes'
import { DifficultyDot } from './CampDetails'
import { KillOrder, KillOrderStrip } from './KillOrder'
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

function HelperToggle({ route, step, onChange }: { route: Route; step: RouteStep; onChange: (s: RouteStep) => void }) {
  const helper = route.race ? CREEP_HELPER[route.race] : undefined
  if (!helper) return null
  const count = step.helpers[helper.name] ?? 0
  const on = count > 0
  const setCount = (n: number) => {
    const helpers = { ...step.helpers }
    if (n <= 0) delete helpers[helper.name]
    else helpers[helper.name] = Math.min(n, helper.maxCount)
    onChange({ ...step, helpers })
  }
  return (
    <Group gap={2} wrap="nowrap">
      <Button
        size="xs"
        variant={on ? 'light' : 'default'}
        color={on ? 'yellow' : 'gray'}
        leftSection={<GameIcon name={helper.icon} size={18} alt={helper.name} dim={!on} />}
        onClick={() => setCount(on ? 0 : helper.defaultCount)}
        aria-pressed={on}
      >
        {helper.name}
        {on ? ' ✓' : '?'}
      </Button>
      {on && helper.counted && (
        <Group gap={0} wrap="nowrap" style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: 6 }}>
          <ActionIcon size="md" variant="subtle" color="gray" onClick={() => setCount(count - 1)} aria-label={`One less ${helper.name}`}>
            <IconMinus size={14} />
          </ActionIcon>
          <Text size="sm" fw={700} ff="monospace" w={24} ta="center" aria-label={`${count} ${helper.name}`}>
            {count}
          </Text>
          <ActionIcon size="md" variant="subtle" color="gray" disabled={count >= helper.maxCount} onClick={() => setCount(count + 1)} aria-label={`One more ${helper.name}`}>
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      )}
    </Group>
  )
}

function StepCard(p: StepProps) {
  const { route, result, readOnly } = p
  const { step, index, camp } = result
  const [showCondition, setShowCondition] = useState(!!step.condition)
  const isWaypoint = step.kind === 'waypoint'
  if (!isWaypoint && !camp) return null

  const skipped = camp && step.rest === 'skip' && step.groups.length ? campInstances(camp).filter((c) => !step.groups.flat().includes(c.uid)) : []
  const helper = route.race ? CREEP_HELPER[route.race] : undefined
  const withHelper = helper && step.helpers[helper.name]

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

          {/* summary line: drops, helper, condition, skills learned */}
          {(result.drops.length > 0 || withHelper || step.condition || result.levelUps.length > 0) && (
            <Group gap={6}>
              {result.drops.map((d, i) => (
                <Badge key={i} size="xs" variant="light" color={LOOT_COLOR[d.type]}>
                  L{d.level} {LOOT_LABEL[d.type]}
                </Badge>
              ))}
              {withHelper && helper && (
                <Badge size="xs" variant="light" color="yellow" leftSection={<GameIcon name={helper.icon} size={12} />}>
                  {helper.counted ? `${step.helpers[helper.name]}× ` : ''}
                  {helper.name}
                </Badge>
              )}
              {step.condition && (
                <Badge size="xs" variant="light" color="grape" tt="none">
                  if {step.condition}
                </Badge>
              )}
              <SkillsLearned route={route} levels={result.levelUps} />
            </Group>
          )}

          {!p.open && camp && <KillOrderStrip groups={result.groups} skipped={skipped} />}
          {!p.open && step.note && (
            <Text size="xs" c="gray.5" lineClamp={2}>
              {step.note}
            </Text>
          )}

          <Collapse in={p.open}>
            <Stack gap="sm" pt={4} pb={4}>
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
                  <Group gap={8} wrap="nowrap" align="center">
                    {camp && <HelperToggle route={route} step={step} onChange={p.onChange} />}
                    {showCondition || step.condition ? (
                      <TextInput
                        size="xs"
                        style={{ flex: 1 }}
                        placeholder="Condition, e.g. only if no early harass"
                        leftSection={<Text size="xs" c="grape.3" fw={700}>if</Text>}
                        value={step.condition}
                        autoFocus={showCondition && !step.condition}
                        onChange={(e) => p.onChange({ ...step, condition: e.currentTarget.value })}
                        onBlur={() => !step.condition && setShowCondition(false)}
                      />
                    ) : (
                      <Button size="xs" variant="default" leftSection={<IconPlus size={14} />} onClick={() => setShowCondition(true)}>
                        Condition
                      </Button>
                    )}
                  </Group>
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

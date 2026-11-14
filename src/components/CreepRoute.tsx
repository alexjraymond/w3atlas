import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Card,
  Collapse,
  Group,
  NumberInput,
  Progress,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconChevronDown, IconTrash } from '@tabler/icons-react'
import type { GameMap, Route, RouteStep } from '../types'
import { campInstances, iconSlug, LOOT_COLOR, LOOT_LABEL } from '../data/maps'
import { simulateRoute, type StepResult } from '../game/route'
import { creepXp } from '../game/xp'
import { HELPERS, HERO_BY_NAME } from '../game/heroes'
import { DifficultyDot } from './CampDetails'
import { GameIcon } from './GameIcon'

interface Props {
  map: GameMap
  route: Route
  onStepsChange: (steps: RouteStep[]) => void
  activeStepId: string | null
  onActiveStep: (id: string | null) => void
  readOnly?: boolean
}

export function XpSummary({ map, route }: { map: GameMap; route: Route }) {
  const { final } = simulateRoute(map, route.steps)
  const capped = final.level >= 5
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" align="baseline">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Hero level after route
        </Text>
        <Text size="xs" c="dimmed">
          {Math.round(final.xp)} XP
        </Text>
      </Group>
      <Group gap="xs" align="baseline" mt={2}>
        <Text fz={28} fw={800} lh={1}>
          {final.exact.toFixed(2)}
        </Text>
        <Text size="xs" c={capped ? 'orange' : 'dimmed'}>
          {capped
            ? 'Level 5+: creeps no longer give XP'
            : `${Math.round(final.intoLevel)} / ${final.levelSpan} to level ${final.level + 1}`}
        </Text>
      </Group>
      <Progress value={final.progress * 100} mt={8} size="sm" color={capped ? 'orange' : 'yellow'} />
    </Card>
  )
}

function SkillLearned({ route, levels }: { route: Route; levels: number[] }) {
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  if (!hero || !levels.length) return null
  return (
    <Group gap={2}>
      {levels.map((lvl) => {
        const skill = route.skills[lvl - 1]
        const ability = hero.abilities.find((a) => a.name === skill)
        return ability ? (
          <Tooltip key={lvl} label={`Level ${lvl}: ${ability.name}`}>
            <span>
              <GameIcon name={ability.icon} size={18} />
            </span>
          </Tooltip>
        ) : null
      })}
    </Group>
  )
}

function StepCard({
  map,
  route,
  result,
  count,
  active,
  onToggle,
  onChange,
  onMove,
  onRemove,
  readOnly,
}: {
  map: GameMap
  route: Route
  result: StepResult
  count: number
  active: boolean
  onToggle: () => void
  onChange: (s: RouteStep) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  readOnly?: boolean
}) {
  const { step, index } = result
  const camp = map.camps.find((c) => c.id === step.campId)
  const [open, setOpen] = useState(false)
  if (!camp) return null
  const instances = campInstances(camp)
  const skipped = new Set(step.skipped)
  const helperOptions = route.race ? HELPERS[route.race] : []
  const helpers = Object.entries(step.helpers)

  return (
    <Card
      withBorder
      padding={8}
      style={{ borderColor: active ? 'var(--mantine-color-yellow-6)' : undefined }}
      onMouseEnter={onToggle}
    >
      <Group wrap="nowrap" gap={8} align="flex-start">
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--mantine-color-yellow-5)',
            color: '#000',
            fontWeight: 800,
            fontSize: 12,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <UnstyledButton onClick={() => setOpen((o) => !o)} style={{ width: '100%' }}>
            <Group gap={6} wrap="nowrap" justify="space-between">
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                <DifficultyDot camp={camp} />
                <Text size="sm" fw={600} truncate>
                  {camp.name}
                </Text>
                {result.killed < result.total && (
                  <Badge size="xs" variant="outline" color="gray">
                    {result.killed}/{result.total}
                  </Badge>
                )}
              </Group>
              <IconChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined, flexShrink: 0 }} />
            </Group>
          </UnstyledButton>

          <Group gap={6}>
            <Text size="xs" c="dimmed">
              +{Math.round(result.xpGained)} XP → Lv {result.after.exact.toFixed(2)}
            </Text>
            {result.levelUps.map((l) => (
              <Badge key={l} size="xs" color="yellow" variant="filled">
                Lv {l}
              </Badge>
            ))}
            <SkillLearned route={route} levels={result.levelUps} />
          </Group>

          {(result.drops.length > 0 || helpers.length > 0) && (
            <Group gap={4}>
              {result.drops.map((d, i) => (
                <Badge key={i} size="xs" variant="light" color={LOOT_COLOR[d.type]}>
                  L{d.level} {LOOT_LABEL[d.type]}
                </Badge>
              ))}
              {helpers.map(([name, n]) => (
                <Badge key={name} size="xs" variant="dot" color="cyan">
                  {n}× {name}
                </Badge>
              ))}
            </Group>
          )}
          {step.note && !open && (
            <Text size="xs" fs="italic" c="gray.4">
              {step.note}
            </Text>
          )}

          <Collapse in={open}>
            <Stack gap={8} pt={6}>
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Creeps killed {readOnly ? '' : '(click to skip)'}
                </Text>
                <Group gap={4}>
                  {instances.map((c) => {
                    const isSkipped = skipped.has(c.uid)
                    return (
                      <Tooltip key={c.uid} label={`${c.name} · lvl ${c.level} · ${creepXp(c.level)} XP${c.loot ? ' · drops item' : ''}`}>
                        <UnstyledButton
                          disabled={readOnly}
                          onClick={() =>
                            onChange({
                              ...step,
                              skipped: isSkipped ? step.skipped.filter((u) => u !== c.uid) : [...step.skipped, c.uid],
                            })
                          }
                          style={{
                            position: 'relative',
                            borderRadius: 4,
                            outline: c.loot ? '1px solid #ff8787' : undefined,
                          }}
                        >
                          <GameIcon name={iconSlug(c.name)} size={28} alt={c.name} dim={isSkipped} />
                          <span
                            style={{
                              position: 'absolute',
                              right: 1,
                              bottom: -1,
                              fontSize: 9,
                              fontWeight: 800,
                              color: '#fff',
                              textShadow: '0 0 2px #000,0 0 2px #000',
                            }}
                          >
                            {c.level}
                          </span>
                        </UnstyledButton>
                      </Tooltip>
                    )
                  })}
                </Group>
              </div>

              {!readOnly && helperOptions.length > 0 && (
                <div>
                  <Text size="xs" c="dimmed" mb={4}>
                    Creeping with
                  </Text>
                  <Group gap={6}>
                    {helperOptions.map((h) => (
                      <NumberInput
                        key={h}
                        size="xs"
                        w={110}
                        min={0}
                        max={24}
                        leftSection={<GameIcon name={iconSlug(h)} size={18} alt={h} />}
                        placeholder={h}
                        aria-label={h}
                        value={step.helpers[h] ?? ''}
                        onChange={(v) => {
                          const n = typeof v === 'number' ? v : parseInt(String(v), 10)
                          const next = { ...step.helpers }
                          if (!n || n <= 0) delete next[h]
                          else next[h] = n
                          onChange({ ...step, helpers: next })
                        }}
                        rightSectionWidth={0}
                        rightSection={<span />}
                        title={h}
                      />
                    ))}
                  </Group>
                </div>
              )}

              {!readOnly && (
                <TextInput
                  size="xs"
                  placeholder="Note for this step (e.g. 'pull the wizard first', 'wait for night')"
                  value={step.note}
                  onChange={(e) => onChange({ ...step, note: e.currentTarget.value })}
                />
              )}
              {readOnly && step.note && <Text size="xs">{step.note}</Text>}
            </Stack>
          </Collapse>
        </Stack>
        {!readOnly && (
          <Stack gap={0}>
            <ActionIcon size="sm" variant="subtle" color="gray" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
              <IconArrowUp size={14} />
            </ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="gray" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">
              <IconArrowDown size={14} />
            </ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="red" onClick={onRemove} aria-label="Remove step">
              <IconTrash size={14} />
            </ActionIcon>
          </Stack>
        )}
      </Group>
    </Card>
  )
}

export function CreepRoute({ map, route, onStepsChange, activeStepId, onActiveStep, readOnly }: Props) {
  const { results } = simulateRoute(map, route.steps)
  const steps = route.steps

  if (!steps.length) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="lg">
        {readOnly ? 'No creep route.' : 'Click camps on the map to build your creep route, in order.'}
      </Text>
    )
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...steps]
    const [s] = next.splice(i, 1)
    next.splice(i + dir, 0, s)
    onStepsChange(next)
  }

  return (
    <Stack gap={6} onMouseLeave={() => onActiveStep(null)}>
      {results.map((r, i) => (
        <StepCard
          key={r.step.id}
          map={map}
          route={route}
          result={r}
          count={steps.length}
          active={activeStepId === r.step.id}
          onToggle={() => onActiveStep(r.step.id)}
          onChange={(s) => onStepsChange(steps.map((x) => (x.id === s.id ? s : x)))}
          onMove={(dir) => move(i, dir)}
          onRemove={() => onStepsChange(steps.filter((x) => x.id !== r.step.id))}
          readOnly={readOnly}
        />
      ))}
    </Stack>
  )
}

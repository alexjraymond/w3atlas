import { Badge, Button, Group, SegmentedControl, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { IconArrowMerge } from '@tabler/icons-react'
import type { Camp, CreepInstance, RouteStep } from '../types'
import { campInstances, iconSlug } from '../data/maps'
import type { GroupResult } from '../game/route'
import { GameIcon } from './GameIcon'
import classes from './KillOrder.module.css'

function creepLabel(c: CreepInstance) {
  const drops = c.drops.length ? ` · drops ${c.drops.map((d) => `L${d.level} ${d.type}`).join(' + ')}` : ''
  return `${c.name} · lvl ${c.level} · ${c.xp} XP${drops}`
}

function Creep({ c, size, dim, onClick, hint }: { c: CreepInstance; size: number; dim?: boolean; onClick?: (e: React.MouseEvent) => void; hint?: string }) {
  const label = creepLabel(c) + (hint ? ` (${hint})` : '')
  const icon = (
    <span className={classes.creep} data-loot={c.drops.length ? true : undefined}>
      <GameIcon name={iconSlug(c.name)} size={size} alt={c.name} dim={dim} />
      <span className={classes.lvl}>{c.level}</span>
    </span>
  )
  return (
    <Tooltip label={label} openDelay={150}>
      {onClick ? (
        <UnstyledButton onClick={onClick} aria-label={label} style={{ display: 'flex' }}>
          {icon}
        </UnstyledButton>
      ) : (
        icon
      )}
    </Tooltip>
  )
}

function XpLine({ xp, levelUps }: { xp: number; levelUps: number[] }) {
  return (
    <Stack gap={2} align="center">
      <Text size="xs" c="dimmed">
        +{Math.round(xp)}
      </Text>
      {levelUps.map((l) => (
        <Badge key={l} size="xs" variant="outline" color="yellow">
          Lv {l}
        </Badge>
      ))}
    </Stack>
  )
}

/** Compact one-line kill order for collapsed steps. */
export function KillOrderStrip({ groups, skipped }: { groups: GroupResult[]; skipped: CreepInstance[] }) {
  return (
    <Group gap={6}>
      {groups.map((g, i) => (
        <span key={i} className={classes.box} data-small data-rest={g.isRest || undefined}>
          {g.creeps.map((c) => (
            <Creep key={c.uid} c={c} size={22} />
          ))}
        </span>
      ))}
      {skipped.length > 0 && (
        <span className={classes.box} data-small data-skipped>
          {skipped.map((c) => (
            <Creep key={c.uid} c={c} size={22} dim hint="skipped" />
          ))}
        </span>
      )}
    </Group>
  )
}

interface Props {
  camp: Camp
  step: RouteStep
  groups: GroupResult[]
  readOnly?: boolean
  onChange: (step: RouteStep) => void
}

/**
 * Kill order in one row: the groups you set (killed in order; inside a group, any order), then
 * the rest of the camp in a dashed box. Click a creep in the dashed box to make it the next group
 * (Shift+click: add it to the last group); click a creep in a group to put it back.
 */
export function KillOrder({ camp, step, groups, readOnly, onChange }: Props) {
  const assigned = new Set(step.groups.flat())
  const rest = campInstances(camp).filter((c) => !assigned.has(c.uid))
  const explicit = groups.filter((g) => !g.isRest)
  const restResult = groups.find((g) => g.isRest)
  const skipping = step.rest === 'skip' && explicit.length > 0

  const add = (uid: string, toLast: boolean) => {
    const gs = step.groups.map((g) => [...g])
    if (toLast && gs.length) gs[gs.length - 1].push(uid)
    else gs.push([uid])
    onChange({ ...step, groups: gs })
  }
  const remove = (uid: string) => onChange({ ...step, groups: step.groups.map((g) => g.filter((u) => u !== uid)).filter((g) => g.length) })
  const merge = (i: number) => {
    const gs = step.groups.map((g) => [...g])
    gs[i - 1].push(...gs[i])
    gs.splice(i, 1)
    onChange({ ...step, groups: gs })
  }

  return (
    <Stack gap={8}>
      <Group justify="space-between" gap={6}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Kill order
        </Text>
        {!readOnly && (
          <Text size="xs" c="dimmed">
            Click to order · Shift+click to group
          </Text>
        )}
      </Group>

      <Group gap={10} align="flex-start">
        {explicit.map((g, i) => (
          <Stack key={i} gap={2} align="center">
            <span className={classes.box}>
              <span className={classes.num}>{i + 1}</span>
              {!readOnly && i > 0 && (
                <Tooltip label="Kill together with the previous group">
                  <UnstyledButton className={classes.merge} onClick={() => merge(i)} aria-label="Merge with previous group">
                    <IconArrowMerge size={11} />
                  </UnstyledButton>
                </Tooltip>
              )}
              {g.creeps.map((c) => (
                <Creep key={c.uid} c={c} size={34} onClick={readOnly ? undefined : () => remove(c.uid)} hint={readOnly ? undefined : 'click to remove'} />
              ))}
            </span>
            <XpLine xp={g.xpGained} levelUps={g.levelUps} />
          </Stack>
        ))}

        {rest.length > 0 && (
          <Stack gap={2} align="center">
            <span className={classes.box} data-rest data-skipped={skipping || undefined}>
              {explicit.length > 0 && <span className={classes.num} data-muted>{skipping ? '×' : '…'}</span>}
              {rest.map((c) => (
                <Creep
                  key={c.uid}
                  c={c}
                  size={34}
                  dim={skipping}
                  onClick={readOnly ? undefined : (e) => add(c.uid, e.shiftKey)}
                  hint={readOnly ? (skipping ? 'skipped' : undefined) : 'click: next group · shift+click: last group'}
                />
              ))}
            </span>
            {skipping ? (
              <Text size="xs" c="dimmed">
                skipped
              </Text>
            ) : (
              restResult && <XpLine xp={restResult.xpGained} levelUps={restResult.levelUps} />
            )}
          </Stack>
        )}
      </Group>

      {!readOnly && explicit.length > 0 && (
        <Group gap={8}>
          {rest.length > 0 && (
            <SegmentedControl
              size="xs"
              value={step.rest}
              onChange={(v) => onChange({ ...step, rest: v as RouteStep['rest'] })}
              data={[
                { value: 'clear', label: 'Then clear the rest' },
                { value: 'skip', label: 'Skip the rest' },
              ]}
            />
          )}
          <Button size="compact-xs" variant="subtle" color="gray" onClick={() => onChange({ ...step, groups: [], rest: 'clear' })}>
            Reset order
          </Button>
        </Group>
      )}
    </Stack>
  )
}

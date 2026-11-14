import { Badge, Button, Group, SegmentedControl, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { IconArrowMerge } from '@tabler/icons-react'
import type { Camp, CreepInstance, RouteStep } from '../types'
import { campInstances, iconSlug } from '../data/maps'
import type { GroupResult } from '../game/route'
import { GameIcon } from './GameIcon'
import classes from './KillOrder.module.css'

function Creep({ c, size, dim, onClick, title }: { c: CreepInstance; size: number; dim?: boolean; onClick?: (e: React.MouseEvent) => void; title?: string }) {
  const label = title ?? `${c.name} · lvl ${c.level} · ${c.xp} XP${c.drops.length ? ` · drops ${c.drops.map((d) => `L${d.level} ${d.type}`).join(' + ')}` : ''}`
  const icon = (
    <span className={classes.creep} data-loot={c.drops.length ? true : undefined}>
      <GameIcon name={iconSlug(c.name)} size={size} alt={c.name} dim={dim} />
      <span className={classes.lvl}>{c.level}</span>
    </span>
  )
  return (
    <Tooltip label={label} openDelay={150}>
      {onClick ? (
        <UnstyledButton onClick={onClick} aria-label={label}>
          {icon}
        </UnstyledButton>
      ) : (
        icon
      )}
    </Tooltip>
  )
}

/** Compact one-line kill order for collapsed steps. */
export function KillOrderStrip({ groups, skipped }: { groups: GroupResult[]; skipped: CreepInstance[] }) {
  return (
    <Group gap={6}>
      {groups.map((g, i) => (
        <span key={i} className={classes.box} data-small>
          {g.creeps.map((c) => (
            <Creep key={c.uid} c={c} size={22} />
          ))}
        </span>
      ))}
      {skipped.map((c) => (
        <Creep key={c.uid} c={c} size={22} dim title={`${c.name} · skipped`} />
      ))}
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
 * Kill order: ordered groups of creeps (a group = kill in any order), each with the XP it gives
 * and any level-up. Click creeps below to add them; Shift+click adds to the last group.
 */
export function KillOrder({ camp, step, groups, readOnly, onChange }: Props) {
  const all = campInstances(camp)
  const assigned = new Set(step.groups.flat())
  const unassigned = all.filter((c) => !assigned.has(c.uid))
  const explicitCount = groups.filter((g) => !g.isRest).length
  const skipped = step.rest === 'skip' ? unassigned : []

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
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        Kill order
      </Text>
      <Group gap={10} align="flex-start">
        {groups.map((g, i) => (
          <Stack key={i} gap={2} align="center">
            <span className={classes.box} data-rest={g.isRest || undefined}>
              {(explicitCount > 0 || !g.isRest) && <span className={classes.num}>{g.isRest ? '…' : i + 1}</span>}
              {!readOnly && !g.isRest && i > 0 && (
                <Tooltip label="Kill together with the previous group">
                  <UnstyledButton className={classes.merge} onClick={() => merge(i)} aria-label="Merge with previous group">
                    <IconArrowMerge size={11} />
                  </UnstyledButton>
                </Tooltip>
              )}
              {g.creeps.map((c) => (
                <Creep key={c.uid} c={c} size={34} onClick={!readOnly && !g.isRest ? () => remove(c.uid) : undefined} />
              ))}
            </span>
            <Text size="xs" ff="monospace" c="dimmed">
              +{Math.round(g.xpGained)}
            </Text>
            {g.levelUps.map((l) => (
              <Badge key={l} size="xs" variant="outline" color="yellow" ff="monospace">
                Lv {l}
              </Badge>
            ))}
          </Stack>
        ))}
        {skipped.length > 0 && (
          <Stack gap={2} align="center">
            <span className={classes.box} data-skipped>
              {skipped.map((c) => (
                <Creep key={c.uid} c={c} size={34} dim title={`${c.name} · skipped`} />
              ))}
            </span>
            <Text size="xs" c="dimmed">
              skipped
            </Text>
          </Stack>
        )}
      </Group>

      {!readOnly && (
        <>
          {unassigned.length > 0 && (
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                {explicitCount ? 'Remaining creeps' : 'Set a kill order (optional)'}: click to add as the next group, Shift+click to add to
                the last group. Click a creep in a group to take it out.
              </Text>
              <Group gap={4}>
                {unassigned.map((c) => (
                  <Creep key={c.uid} c={c} size={30} onClick={(e) => add(c.uid, e.shiftKey)} />
                ))}
              </Group>
            </div>
          )}
          {explicitCount > 0 && (
            <Group justify="space-between">
              {unassigned.length > 0 ? (
                <SegmentedControl
                  size="xs"
                  value={step.rest}
                  onChange={(v) => onChange({ ...step, rest: v as RouteStep['rest'] })}
                  data={[
                    { value: 'clear', label: 'Then clear the rest' },
                    { value: 'skip', label: 'Skip the rest' },
                  ]}
                />
              ) : (
                <span />
              )}
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => onChange({ ...step, groups: [], rest: 'clear' })}>
                Clear order
              </Button>
            </Group>
          )}
        </>
      )}
    </Stack>
  )
}

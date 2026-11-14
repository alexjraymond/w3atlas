import { Fragment } from 'react'
import { Button, Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { autoSkills, maxOrder, SKILL_COLORS, SKILL_KEYS, validateSkill, type Hero } from '../game/heroes'
import { GameIcon } from './GameIcon'
import classes from './SkillGrid.module.css'

interface Props {
  hero: Hero
  skills: string[] // ability name per hero level 1..10
  onChange?: (skills: string[]) => void
}

function Key({ index }: { index: number }) {
  return (
    <Text span fw={800} c={SKILL_COLORS[index]}>
      {SKILL_KEYS[index]}
    </Text>
  )
}

/**
 * Skill order as a grid: one row per ability, one column per hero level. Click a cell to learn
 * that ability at that level. "Max" shows the order basics reach rank 3; clicking a basic's icon
 * in edit mode rebuilds all 10 levels with that ability as the top priority.
 */
export function SkillGrid({ hero, skills, onChange }: Props) {
  const editable = !!onChange
  const order = maxOrder(hero, skills)
  const indexOf = (name: string) => hero.abilities.findIndex((a) => a.name === name)

  const setCell = (level: number, name: string) => {
    if (!onChange) return
    const next = [...skills]
    next[level] = next[level] === name ? '' : name
    onChange(next)
  }

  /** Move `name` to the front of the current max order and refill every level from it. */
  const prioritise = (name: string) => {
    if (!onChange) return
    const current = order.length ? order : hero.abilities.filter((a) => !a.ultimate).map((a) => a.name)
    onChange(autoSkills(hero, [name, ...current.filter((n) => n !== name)]))
  }

  return (
    <div className={classes.wrap}>
      <Group justify="space-between" mb={8} wrap="nowrap">
        <Group gap={6} wrap="nowrap">
          <Text size="xs" c="dimmed" fw={600}>
            Max:
          </Text>
          {order.length ? (
            order.map((name, i) => (
              <Group key={name} gap={6} wrap="nowrap">
                {i > 0 && <IconArrowRight size={12} color="var(--mantine-color-dimmed)" />}
                <Tooltip label={name}>
                  <span>
                    <Key index={indexOf(name)} />
                  </span>
                </Tooltip>
              </Group>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              —
            </Text>
          )}
        </Group>
        {editable && skills.some(Boolean) && (
          <Button size="compact-xs" variant="subtle" color="gray" onClick={() => onChange(Array(10).fill(''))}>
            Clear
          </Button>
        )}
      </Group>

      <div className={classes.grid}>
        <span />
        {skills.map((_, i) => (
          <span key={i} className={classes.levelNum}>
            {i + 1}
          </span>
        ))}
        {hero.abilities.map((a, row) => (
          <Fragment key={a.name}>
            <Tooltip label={editable && !a.ultimate ? `${a.name}: click to max first` : a.name} openDelay={200}>
              <UnstyledButton
                className={classes.icon}
                onClick={editable && !a.ultimate ? () => prioritise(a.name) : undefined}
                style={{ cursor: editable && !a.ultimate ? 'pointer' : 'default' }}
                aria-label={editable && !a.ultimate ? `Max ${a.name} first` : a.name}
              >
                <GameIcon name={a.icon} size={30} alt={a.name} />
              </UnstyledButton>
            </Tooltip>
            {skills.map((s, level) => {
              const on = s === a.name
              const error = on ? validateSkill(hero, skills, level) : null
              const cell = (
                <span
                  className={classes.cell}
                  data-on={on || undefined}
                  data-error={error ? true : undefined}
                  style={on ? { color: SKILL_COLORS[row] } : undefined}
                >
                  {on ? SKILL_KEYS[row] : ''}
                </span>
              )
              return editable ? (
                <Tooltip key={level} label={error ?? `Level ${level + 1}: ${a.name}`} color={error ? 'red' : undefined} openDelay={300}>
                  <UnstyledButton className={classes.slot} onClick={() => setCell(level, a.name)} aria-label={`Level ${level + 1}: ${a.name}`}>
                    {cell}
                  </UnstyledButton>
                </Tooltip>
              ) : (
                <span key={level} className={classes.slot}>
                  {cell}
                </span>
              )
            })}
          </Fragment>
        ))}
      </div>
      {editable && (
        <Text size="xs" c="dimmed" mt={6}>
          Click an ability icon to max it first (levels fill in automatically), or click cells to adjust.
        </Text>
      )}
    </div>
  )
}

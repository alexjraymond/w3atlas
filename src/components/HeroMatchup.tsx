import { useState } from 'react'
import { Button, Group, Switch, Text, Tooltip } from '@mantine/core'
import type { Matchup, Race, Route } from '../types'
import { autoSkills, HERO_BY_NAME, heroesForRace, maxOrder, RACE_LABEL, RACES, validateSkill } from '../game/heroes'
import { GameIcon } from './GameIcon'
import { Win } from './Win'
import classes from './HeroMatchup.module.css'

const OPEN_KEY = 'w3atlas.heroOpen'
function readOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) !== '0'
  } catch {
    return true
  }
}

function RaceCircles({ value, onPick, label, readOnly }: { value: Race | 'any' | null; onPick?: (r: Race) => void; label: string; readOnly?: boolean }) {
  return (
    <div className={classes.side} role="group" aria-label={label}>
      {RACES.map((r) => (
        <Tooltip key={r.id} label={r.label} openDelay={250}>
          <button
            type="button"
            className={classes.circle}
            aria-pressed={value === r.id}
            aria-label={`${label}: ${r.label}`}
            disabled={readOnly && value !== r.id}
            onClick={() => onPick?.(r.id)}
            style={readOnly ? { cursor: 'default' } : undefined}
          >
            <GameIcon name={r.icon} size={42} alt="" />
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

/** Player race on the left, opponent on the right. Tapping the selected opponent again means "any". */
export function MatchupPicker({ race, vs, onChange, readOnly }: { race: Race | null; vs: Matchup; onChange?: (p: { race?: Race; vs?: Matchup }) => void; readOnly?: boolean }) {
  return (
    <div className={classes.vs}>
      <RaceCircles value={race} label="Your race" readOnly={readOnly} onPick={(r) => onChange?.({ race: r })} />
      <span className={classes.vsWord}>vs.</span>
      <RaceCircles value={vs} label="Opponent" readOnly={readOnly} onPick={(r) => onChange?.({ vs: vs === r ? 'any' : r })} />
    </div>
  )
}

/** Skill order as a strip of 10 level slots. Click abilities in the order you learn them; click a slot to clear it. */
function SkillOrder({ route, onChange }: { route: Route; onChange?: (skills: string[]) => void }) {
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  if (!hero) return null
  const skills = route.skills
  const next = skills.findIndex((s) => !s)
  const canLearn = (name: string) => {
    if (next < 0) return false
    const trial = [...skills]
    trial[next] = name
    return !validateSkill(hero, trial, next)
  }
  const ranks = (name: string) => skills.filter((s) => s === name).length
  const editable = !!onChange
  return (
    <div>
      {editable && (
        <div className={classes.abilities}>
          {hero.abilities.map((a) => (
            <Tooltip key={a.name} label={`${a.name}${a.ultimate ? ' (ultimate, level 6)' : ''}`} openDelay={150}>
              <button type="button" className={classes.ability} disabled={!canLearn(a.name)} onClick={() => {
                const s = [...skills]
                s[next] = a.name
                onChange(s)
              }} aria-label={`Learn ${a.name} at level ${next + 1}`}>
                <GameIcon name={a.icon} size={36} alt="" />
                {ranks(a.name) > 0 && <b>{ranks(a.name)}</b>}
              </button>
            </Tooltip>
          ))}
          <Group gap={6} ml="auto">
            <Button size="compact-sm" variant="default" onClick={() => onChange(autoSkills(hero, maxOrder(hero, skills)))}>
              Auto
            </Button>
            <Button size="compact-sm" variant="default" disabled={!skills.some(Boolean)} onClick={() => onChange(Array(10).fill(''))}>
              Clear
            </Button>
          </Group>
        </div>
      )}
      <div className={classes.slots}>
        {skills.map((name, i) => {
          const ability = hero.abilities.find((a) => a.name === name)
          const error = name ? validateSkill(hero, skills, i) : null
          const Tag = editable && name ? 'button' : 'span'
          const content = (
            <Tag
              key={i}
              {...(Tag === 'button' ? { type: 'button' as const, onClick: () => onChange!(skills.map((s, j) => (j === i ? '' : s))), 'aria-label': `Level ${i + 1}: ${name}. Clear` } : {})}
              className={classes.slot}
              data-filled={ability ? true : undefined}
              data-error={error ? true : undefined}
            >
              {ability && <GameIcon name={ability.icon} size={34} alt={`Level ${i + 1}: ${ability.name}`} />}
              <i>{i + 1}</i>
            </Tag>
          )
          return ability ? (
            <Tooltip key={i} label={error ? `${ability.name}: ${error}` : `Level ${i + 1}: ${ability.name}`} openDelay={100}>
              {content}
            </Tooltip>
          ) : (
            content
          )
        })}
      </div>
    </div>
  )
}

/** Hero and matchup in one foldable window: race vs race, hero, skill order. */
export function HeroMatchup({ route, onChange }: { route: Route; onChange?: (patch: Partial<Route>) => void }) {
  const readOnly = !onChange
  const [open, setOpen] = useState(readOpen)
  const current = route.hero ? HERO_BY_NAME[route.hero] : null
  const [tavern, setTavern] = useState(current?.race === 'neutral')
  const heroes = heroesForRace(route.race, tavern).filter((h) => !tavern || !route.race || h.race === 'neutral')
  const toggle = () => {
    setOpen(!open)
    try {
      localStorage.setItem(OPEN_KEY, open ? '0' : '1')
    } catch {
      /* private mode: just don't remember */
    }
  }

  const summary = (
    <span className={classes.summary}>
      {route.race ? `${RACE_LABEL[route.race]} vs ${route.vs === 'any' ? 'any' : RACE_LABEL[route.vs]}` : 'Pick your race'}
      {current && (
        <>
          {' · '}
          <GameIcon name={current.icon} size={20} alt="" />
          {current.name}
        </>
      )}
    </span>
  )

  return (
    <Win title={<>Hero &amp; matchup{!open && summary}</>} tone="sky" open={open} onToggle={toggle}>
      <div className={classes.grid}>
        <div className={classes.block}>
          <div className={classes.cap}>
            <span>Matchup</span>
            {!readOnly && <small>You · Opponent</small>}
          </div>
          <MatchupPicker
            race={route.race}
            vs={route.vs}
            readOnly={readOnly}
            onChange={(p) => {
              if (!onChange) return
              if (p.race) {
                const keepHero = current && (current.race === 'neutral' || current.race === p.race)
                onChange({ race: p.race, ...(keepHero ? {} : { hero: null, skills: Array(10).fill('') }) })
              } else if (p.vs) onChange({ vs: p.vs })
            }}
          />
        </div>

        <div className={classes.block}>
          <div className={classes.cap}>
            <span>Hero</span>
            {!readOnly && <Switch size="xs" label="Tavern" checked={tavern} onChange={(e) => setTavern(e.currentTarget.checked)} />}
          </div>
          {readOnly ? (
            current ? (
              <Group gap={8}>
                <GameIcon name={current.icon} size={40} alt="" />
                <Text fw={900}>{current.name}</Text>
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                No hero picked.
              </Text>
            )
          ) : heroes.length ? (
            <div className={classes.heroes}>
              {heroes.map((h) => (
                <Tooltip key={h.name} label={h.name} openDelay={150}>
                  <button
                    type="button"
                    className={classes.hero}
                    aria-pressed={route.hero === h.name}
                    aria-label={h.name}
                    onClick={() => h.name !== route.hero && onChange?.({ hero: h.name, skills: autoSkills(h, []) })}
                  >
                    <GameIcon name={h.icon} size={40} alt="" />
                  </button>
                </Tooltip>
              ))}
            </div>
          ) : (
            <Text size="sm" c="dimmed">
              Pick your race first, or turn on Tavern.
            </Text>
          )}
        </div>

        <div className={classes.block}>
          <div className={classes.cap}>
            <span>Skill order</span>
            {!readOnly && current && <small>Click abilities in the order you learn them</small>}
          </div>
          {current ? (
            <SkillOrder route={route} onChange={readOnly ? undefined : (skills) => onChange?.({ skills })} />
          ) : (
            <Text size="sm" c="dimmed">
              Pick a hero to plan skills.
            </Text>
          )}
        </div>
      </div>
    </Win>
  )
}

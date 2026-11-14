import { useState } from 'react'
import {
  ActionIcon,
  Group,
  Popover,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import type { Race, Route } from '../types'
import { HERO_BY_NAME, heroesForRace, RACES, validateSkill, type Hero } from '../game/heroes'
import { GameIcon } from './GameIcon'
import { Label } from './BuildFields'

interface Props {
  route: Route
  onChange: (patch: Partial<Route>) => void
}

export function RacePicker({ value, onChange }: { value: Race | null; onChange: (r: Race) => void }) {
  return (
    <SimpleGrid cols={4} spacing={6}>
      {RACES.map((r) => (
        <Tooltip key={r.id} label={r.label} openDelay={300}>
          <UnstyledButton
            onClick={() => onChange(r.id)}
            aria-pressed={value === r.id}
            style={{
              borderRadius: 8,
              padding: 6,
              display: 'grid',
              placeItems: 'center',
              gap: 2,
              border: `2px solid ${value === r.id ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-dark-4)'}`,
              background: value === r.id ? 'var(--mantine-color-dark-5)' : 'transparent',
            }}
          >
            <GameIcon name={r.icon} size={36} dim={!!value && value !== r.id} />
            <Text size="10px" fw={600}>
              {r.label}
            </Text>
          </UnstyledButton>
        </Tooltip>
      ))}
    </SimpleGrid>
  )
}

function HeroGrid({ heroes, selected, onSelect }: { heroes: Hero[]; selected: string | null; onSelect: (h: string) => void }) {
  return (
    <SimpleGrid cols={4} spacing={6}>
      {heroes.map((h) => (
        <Tooltip key={h.name} label={h.name} openDelay={200}>
          <UnstyledButton
            onClick={() => onSelect(h.name)}
            aria-pressed={selected === h.name}
            style={{
              borderRadius: 8,
              padding: 3,
              display: 'grid',
              placeItems: 'center',
              border: `2px solid ${selected === h.name ? 'var(--mantine-color-yellow-5)' : 'transparent'}`,
            }}
          >
            <GameIcon name={h.icon} size={44} alt={h.name} dim={!!selected && selected !== h.name} />
          </UnstyledButton>
        </Tooltip>
      ))}
    </SimpleGrid>
  )
}

function SkillOrder({ hero, skills, onChange }: { hero: Hero; skills: string[]; onChange: (s: string[]) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const set = (i: number, name: string) => {
    const next = [...skills]
    next[i] = name
    onChange(next)
    setOpen(i < 9 ? i + 1 : null) // advance to the next slot for quick entry
  }
  return (
    <SimpleGrid cols={{ base: 5 }} spacing={4} verticalSpacing={6}>
      {skills.map((name, i) => {
        const ability = hero.abilities.find((a) => a.name === name)
        const error = validateSkill(hero, skills, i)
        return (
          <Popover key={i} opened={open === i} onChange={(o) => !o && setOpen(null)} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Tooltip label={error ?? (name ? name : `Level ${i + 1}`)} color={error ? 'red' : undefined} openDelay={200}>
                <UnstyledButton
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    position: 'relative',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 6,
                    border: `2px solid ${error ? 'var(--mantine-color-red-6)' : open === i ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-dark-4)'}`,
                  }}
                >
                  <GameIcon name={ability?.icon ?? ''} size={34} alt={name || `Level ${i + 1}`} dim={!name} />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 2,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#fff',
                      textShadow: '0 0 3px #000, 0 0 3px #000',
                    }}
                  >
                    {i + 1}
                  </span>
                </UnstyledButton>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown p={6}>
              <Text size="xs" c="dimmed" mb={4}>
                Hero level {i + 1}
              </Text>
              <Group gap={4} wrap="nowrap">
                {hero.abilities.map((a) => (
                  <Tooltip key={a.name} label={a.name}>
                    <ActionIcon variant="subtle" size={40} onClick={() => set(i, a.name)}>
                      <GameIcon name={a.icon} size={36} alt={a.name} />
                    </ActionIcon>
                  </Tooltip>
                ))}
                {name && (
                  <ActionIcon variant="subtle" color="gray" size={40} onClick={() => set(i, '')} aria-label="Clear">
                    ✕
                  </ActionIcon>
                )}
              </Group>
            </Popover.Dropdown>
          </Popover>
        )
      })}
    </SimpleGrid>
  )
}

export function HeroPanel({ route, onChange }: Props) {
  const current = route.hero ? HERO_BY_NAME[route.hero] : null
  const [tavern, setTavern] = useState(current?.race === 'neutral')
  const heroes = heroesForRace(route.race, tavern)

  return (
    <Stack gap="sm">
      <div>
        <Label>Your race</Label>
        <RacePicker
          value={route.race}
          onChange={(race) => {
            const keepHero = current && (current.race === 'neutral' || current.race === race)
            onChange({ race, ...(keepHero ? {} : { hero: null, skills: Array(10).fill('') }) })
          }}
        />
      </div>

      <div>
        <Group justify="space-between" mb={6}>
          <Label>Hero</Label>
          <Switch size="xs" label="Tavern" checked={tavern} onChange={(e) => setTavern(e.currentTarget.checked)} />
        </Group>
        {heroes.length ? (
          <HeroGrid
            heroes={tavern && route.race ? heroes.filter((h) => h.race === 'neutral') : heroes}
            selected={route.hero}
            onSelect={(hero) => hero !== route.hero && onChange({ hero, skills: Array(10).fill('') })}
          />
        ) : (
          <Text size="xs" c="dimmed">
            Pick a race (or enable Tavern) to choose a hero.
          </Text>
        )}
      </div>

      {current && (
        <div>
          <Group justify="space-between" mb={6}>
            <Label>Skill order</Label>
            <Text size="xs" c="dimmed">
              {current.name}
            </Text>
          </Group>
          <SkillOrder hero={current} skills={route.skills} onChange={(skills) => onChange({ skills })} />
        </div>
      )}
    </Stack>
  )
}

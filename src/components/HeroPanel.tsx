import { useState } from 'react'
import {
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import type { Race, Route } from '../types'
import { autoSkills, HERO_BY_NAME, heroesForRace, RACES, type Hero } from '../game/heroes'
import { GameIcon } from './GameIcon'
import { Label } from './BuildFields'
import { SkillGrid } from './SkillGrid'

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
              border: `2px solid ${value === r.id ? 'var(--w-ink)' : 'var(--w-ink)'}`,
              background: value === r.id ? 'var(--w-lime)' : 'transparent',
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
              border: `2px solid ${selected === h.name ? 'var(--w-ink)' : 'transparent'}`,
            }}
          >
            <GameIcon name={h.icon} size={44} alt={h.name} dim={!!selected && selected !== h.name} />
          </UnstyledButton>
        </Tooltip>
      ))}
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
            onSelect={(hero) => hero !== route.hero && onChange({ hero, skills: autoSkills(HERO_BY_NAME[hero], []) })}
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
          <SkillGrid hero={current} skills={route.skills} onChange={(skills) => onChange({ skills })} />
        </div>
      )}
    </Stack>
  )
}

import { useState } from 'react'
import { ActionIcon, Button, Group, Popover, SimpleGrid, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import type { Race } from '../types'
import { HEROES, RACES, UNITS } from '../game/heroes'
import { iconSlug } from '../data/maps'
import { GameIcon } from './GameIcon'

interface Props {
  race: Race | null
  value: Record<string, number>
  onChange?: (v: Record<string, number>) => void
}

const heroIcon = (name: string) => HEROES.find((h) => h.name === name)?.icon ?? iconSlug(name)

/** "Bring 5× Footman, Archmage" — units that come along for a step. */
export function BringUnits({ race, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(value)
  const set = (name: string, n: number) => {
    const next = { ...value }
    if (n <= 0) delete next[name]
    else next[name] = Math.min(n, 24)
    onChange?.(next)
  }

  const races = race ? [race] : RACES.map((r) => r.id)
  const options = races.flatMap((r) => [...HEROES.filter((h) => h.race === r).map((h) => h.name), ...UNITS[r]])

  if (!onChange) {
    if (!entries.length) return null
    return (
      <Group gap={8}>
        <Text size="sm" c="dimmed">
          Bring
        </Text>
        {entries.map(([name, n]) => (
          <Tooltip key={name} label={name}>
            <Group gap={2} wrap="nowrap">
              <GameIcon name={heroIcon(name)} size={28} alt={name} />
              {n > 1 && (
                <Text size="sm" ff="monospace">
                  ×{n}
                </Text>
              )}
            </Group>
          </Tooltip>
        ))}
      </Group>
    )
  }

  return (
    <Group gap={6}>
      {entries.map(([name, n]) => (
        <Group key={name} gap={2} wrap="nowrap" style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: 8, padding: '2px 4px' }}>
          <Tooltip label={name}>
            <span style={{ display: 'flex' }}>
              <GameIcon name={heroIcon(name)} size={24} alt={name} />
            </span>
          </Tooltip>
          <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => set(name, n - 1)} aria-label={`One less ${name}`}>
            <IconMinus size={12} />
          </ActionIcon>
          <Text size="xs" ff="monospace" w={18} ta="center">
            {n}
          </Text>
          <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => set(name, n + 1)} aria-label={`One more ${name}`}>
            <IconPlus size={12} />
          </ActionIcon>
        </Group>
      ))}
      <Popover opened={open} onChange={setOpen} position="bottom-start" shadow="md" withArrow>
        <Popover.Target>
          <Button size="xs" variant="default" leftSection={<IconPlus size={14} />} onClick={() => setOpen((o) => !o)}>
            Bring units
          </Button>
        </Popover.Target>
        <Popover.Dropdown p={6} maw={320}>
          <SimpleGrid cols={6} spacing={4}>
            {options.map((name) => (
              <Tooltip key={name} label={name}>
                <UnstyledButton
                  onClick={() => set(name, (value[name] ?? 0) + 1)}
                  style={{ borderRadius: 6, display: 'grid', placeItems: 'center', padding: 2 }}
                  aria-label={`Bring ${name}`}
                >
                  <GameIcon name={heroIcon(name)} size={36} alt={name} />
                </UnstyledButton>
              </Tooltip>
            ))}
          </SimpleGrid>
          {!race && (
            <Text size="xs" c="dimmed" mt={6}>
              Pick your race to shorten this list.
            </Text>
          )}
        </Popover.Dropdown>
      </Popover>
    </Group>
  )
}

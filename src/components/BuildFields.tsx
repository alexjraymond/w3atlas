import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import type { Matchup } from '../types'
import { RACES } from '../game/heroes'
import { GameIcon } from './GameIcon'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6} style={{ letterSpacing: 1 }}>
      {children}
    </Text>
  )
}

/** Opponent picker: Any + the four races. */
export function AgainstPicker({ value, onChange }: { value: Matchup; onChange: (v: Matchup) => void }) {
  const opts: { id: Matchup; label: string; icon: string }[] = [{ id: 'any', label: 'Any', icon: '' }, ...RACES]
  return (
    <Group gap={6}>
      {opts.map((o) => (
        <Tooltip key={o.id} label={o.label}>
          <UnstyledButton
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            aria-label={`Against ${o.label}`}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              border: `2px solid ${value === o.id ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-dark-4)'}`,
              background: 'var(--mantine-color-dark-7)',
              fontWeight: 800,
              fontSize: 18,
              color: 'var(--mantine-color-dimmed)',
            }}
          >
            {o.icon ? <GameIcon name={o.icon} size={34} dim={value !== o.id} style={{ borderRadius: '50%' }} /> : '?'}
          </UnstyledButton>
        </Tooltip>
      ))}
    </Group>
  )
}


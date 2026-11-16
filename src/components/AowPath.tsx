import { ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import type { AowPoint } from '../types'
import { GameIcon } from './GameIcon'
import { Win } from './Win'

const label = (i: number) => (i === 0 ? 'Start' : `${i}`)

function Title({ count }: { count: number }) {
  return (
    <Group gap={8} wrap="nowrap" component="span">
      <GameIcon name="ancientofwar" size={18} />
      <span>Ancient of War path{count > 0 ? ` · ${count}` : ''}</span>
    </Group>
  )
}

/** Edit mode: the list of AoW path points (placed on the map), with a note for each. */
export function AowPathEditor({
  path,
  onChange,
  placing,
  onTogglePlacing,
}: {
  path: AowPoint[]
  onChange: (path: AowPoint[]) => void
  placing: boolean
  onTogglePlacing: () => void
}) {
  return (
    <Win
      title={<Title count={path.length} />}
      tone="white"
      bodyStyle={{ padding: 12 }}
    >
      <Group gap={8} mb={10}>
        <Button size="xs" variant={placing ? 'filled' : 'default'} leftSection={placing ? undefined : <IconPlus size={14} />} onClick={onTogglePlacing}>
          {placing ? 'Done' : path.length ? 'Add points' : 'Draw path'}
        </Button>
        {path.length > 0 && !placing && (
          <Button size="xs" variant="default" leftSection={<IconTrash size={14} />} onClick={() => confirm('Remove the Ancient of War path?') && onChange([])}>
            Remove path
          </Button>
        )}
      </Group>
      {path.length === 0 ? (
        <Text size="xs" c="dimmed">
          Plan where the Ancient of War walks while the hero creeps. It's slow, so the path matters. Draw it point by point, then drag points on the map
          to adjust them. Remove one with its × below, or right-click it on the map.
        </Text>
      ) : (
        <Stack gap={4}>
          {path.map((p, i) => (
            <Group key={p.id} gap={6} wrap="nowrap">
              <Text size="xs" fw={700} w={34} c="var(--w-aow-text)">
                {label(i)}
              </Text>
              <TextInput
                size="xs"
                style={{ flex: 1 }}
                placeholder={i === 0 ? 'e.g. Built at home, uproot at 0:50' : 'e.g. Wait here for the hero, then root'}
                value={p.note}
                onChange={(e) => onChange(path.map((q) => (q.id === p.id ? { ...q, note: e.currentTarget.value } : q)))}
              />
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Remove point ${label(i)}`} onClick={() => onChange(path.filter((q) => q.id !== p.id))}>
                <IconX size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}
    </Win>
  )
}

/** View mode: the path's notes (only points that have one). */
export function AowPathList({ path }: { path: AowPoint[] }) {
  const noted = path.map((p, i) => ({ ...p, i })).filter((p) => p.note.trim())
  return (
    <Win title={<Title count={path.length} />} tone="white" bodyStyle={{ padding: 12 }}>
      {noted.length === 0 ? (
        <Text size="xs" c="dimmed">
          Follow the green dotted line on the map.
        </Text>
      ) : (
        <Stack gap={2}>
          {noted.map((p) => (
            <Text key={p.id} size="sm">
              <Text span fw={700} c="var(--w-aow-text)" mr={6}>
                {label(p.i)}
              </Text>
              {p.note}
            </Text>
          ))}
        </Stack>
      )}
    </Win>
  )
}

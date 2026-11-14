import { useState } from 'react'
import { Button, Group, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import type { Race } from '../types'
import { builds, useBuilds, useRoutes } from '../store'
import { newBuild } from '../game/route'
import { href, navigate } from '../lib/router'
import { BuildCard } from '../components/BuildCard'

export function BuildsPage() {
  const all = useBuilds()
  const routes = useRoutes()
  const [race, setRace] = useState<'all' | Race>('all')
  const list = all.filter((b) => race === 'all' || b.race === race).sort((a, b) => b.updatedAt - a.updatedAt)

  const create = () => {
    const b = builds.save(newBuild({ race: race === 'all' ? null : race }))
    navigate(href.build(b.id))
  }

  return (
    <Stack gap="md" px={{ base: 'xs', sm: 0 }}>
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Build orders</Title>
          <Text size="sm" c="dimmed">
            Builds aren't tied to a map. Link one to any number of creep routes.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={create}>
          New build
        </Button>
      </Group>
      <SegmentedControl
        size="xs"
        value={race}
        onChange={(v) => setRace(v as typeof race)}
        data={[
          { value: 'all', label: 'All' },
          { value: 'human', label: 'Human' },
          { value: 'orc', label: 'Orc' },
          { value: 'nightelf', label: 'Night Elf' },
          { value: 'undead', label: 'Undead' },
        ]}
        style={{ alignSelf: 'flex-start' }}
      />
      {list.length ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {list.map((b) => (
            <BuildCard key={b.id} build={b} usedBy={routes.filter((r) => r.buildId === b.id).length} />
          ))}
        </SimpleGrid>
      ) : (
        <Stack align="center" py="xl" gap="xs">
          <Text c="dimmed" size="sm">
            No build orders yet.
          </Text>
          <Button variant="light" size="xs" onClick={create}>
            Create one
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

import { useState } from 'react'
import { Anchor, Button, Grid, Group, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { routes as routeStore, useRoutes } from '../store'
import { newRoute } from '../game/route'
import { MapCanvas } from '../components/MapCanvas'
import { RouteCard } from '../components/RouteCard'
import { NotFound } from './NotFound'
import type { Race } from '../types'

export function MapPage({ mapId }: { mapId: string }) {
  const map = MAP_BY_ID[mapId]
  const routes = useRoutes()
  const [race, setRace] = useState<'all' | Race>('all')
  if (!map) return <NotFound />

  const mapRoutes = routes
    .filter((r) => r.mapId === map.id && (race === 'all' || r.race === race))
    .sort((a, b) => b.updatedAt - a.updatedAt)

  const create = () => {
    const r = routeStore.save(newRoute(map.id, { name: `${map.name} route`, race: race === 'all' ? null : race }))
    navigate(href.route(r.id))
  }

  return (
    <Stack gap="md" px={{ base: 'xs', sm: 0 }}>
      <Group justify="space-between" align="flex-end">
        <div>
          <Anchor href={href.home()} size="xs" c="dimmed">
            ← All maps
          </Anchor>
          <Title order={2}>{map.name}</Title>
          <Text size="sm" c="dimmed">
            {map.camps.length} creep camps · hover a camp to see its creeps and drops
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={create}>
          New route
        </Button>
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <MapCanvas map={map} readOnly />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="sm">
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
            />
            {mapRoutes.length ? (
              <SimpleGrid cols={1} spacing="sm">
                {mapRoutes.map((r) => (
                  <RouteCard key={r.id} route={r} />
                ))}
              </SimpleGrid>
            ) : (
              <Stack align="center" py="xl" gap="xs">
                <Text c="dimmed" size="sm">
                  No saved routes for {map.name}
                  {race !== 'all' ? ' with this race' : ''} yet.
                </Text>
                <Button variant="light" size="xs" onClick={create}>
                  Create one
                </Button>
              </Stack>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

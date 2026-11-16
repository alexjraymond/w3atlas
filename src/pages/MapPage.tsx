import { useEffect, useState } from 'react'
import { Anchor, Button, Grid, Group, Loader, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { createRoute, useRoutes } from '../store'
import { MapCanvas } from '../components/MapCanvas'
import { RouteCard } from '../components/RouteCard'
import { NotFound } from './NotFound'
import type { Race } from '../types'
import { cloud, type RouteSummary } from '../cloud'
import { CommunityRouteCard } from '../components/CommunityRouteCard'

/** Top public routes for this map, with a link to the full Community list. */
function MapCommunity({ mapId, race }: { mapId: string; race?: Race }) {
  const [items, setItems] = useState<RouteSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setItems(null)
    cloud
      ?.listRoutes({ mapId, race, sort: 'top', page: 0 })
      .then((r) => alive && setItems(r.items.slice(0, 8)))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      alive = false
    }
  }, [mapId, race])
  if (error) return <Text size="sm" c="red">{error}</Text>
  if (!items) return <Loader size="sm" />
  return (
    <Stack gap="sm">
      {items.length ? (
        items.map((r) => <CommunityRouteCard key={r.id} route={r} showMap={false} />)
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="lg">
          Nobody has shared a route for this map yet.
        </Text>
      )}
      <Anchor href={href.community({ map: mapId, race })} size="sm">
        Browse all community routes for this map →
      </Anchor>
    </Stack>
  )
}

export function MapPage({ mapId }: { mapId: string }) {
  const map = MAP_BY_ID[mapId]
  const routes = useRoutes()
  const [race, setRace] = useState<'all' | Race>('all')
  const [tab, setTab] = useState<'mine' | 'community'>('mine')
  if (!map) return <NotFound />

  const mapRoutes = routes
    .filter((r) => r.mapId === map.id && (race === 'all' || r.race === race))
    .sort((a, b) => b.updatedAt - a.updatedAt)

  const create = () => {
    const r = createRoute(map.id, { name: `${map.name} route`, race: race === 'all' ? null : race })
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
            {cloud && (
              <SegmentedControl
                size="xs"
                value={tab}
                onChange={(v) => setTab(v as typeof tab)}
                data={[
                  { value: 'mine', label: `My routes (${mapRoutes.length})` },
                  { value: 'community', label: 'Community' },
                ]}
              />
            )}
            {tab === 'community' ? (
              <MapCommunity mapId={map.id} race={race === 'all' ? undefined : race} />
            ) : mapRoutes.length ? (
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

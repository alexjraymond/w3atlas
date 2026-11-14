import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { decodeShare, importRoutes } from '../store/routes'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { MapCanvas } from '../components/MapCanvas'
import { NotFound } from './NotFound'

export function SharePage({ code }: { code: string }) {
  const route = decodeShare(code)
  if (!route) return <NotFound what="share link" />
  const map = MAP_BY_ID[route.mapId]

  return (
    <Stack gap="md" maw={720} mx="auto" px={{ base: 'xs', sm: 0 }}>
      <div>
        <Text size="xs" c="dimmed">
          Shared route · {map.name}
        </Text>
        <Title order={2}>{route.name}</Title>
        <Text size="sm" c="dimmed">
          {route.hero ?? 'No hero'} · {route.steps.length} camps · {route.build.length} build steps
        </Text>
      </div>
      <MapCanvas map={map} steps={route.steps} notes={route.mapNotes} readOnly />
      <Group>
        <Button
          onClick={() => {
            const [saved] = importRoutes(route)
            navigate(href.route(saved.id))
          }}
        >
          Save to my routes
        </Button>
        <Button variant="default" component="a" href={href.map(map.id)}>
          Open {map.name}
        </Button>
      </Group>
    </Stack>
  )
}

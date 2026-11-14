import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { decodeShare, importData } from '../store'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { MapCanvas } from '../components/MapCanvas'
import { NotFound } from './NotFound'

export function SharePage({ code }: { code: string }) {
  const shared = decodeShare(code)
  if (!shared) return <NotFound what="share link" />
  const { route, build, raw } = shared
  const map = MAP_BY_ID[route.mapId]

  return (
    <Stack gap="md" maw={720} mx="auto" px={{ base: 'xs', sm: 0 }}>
      <div>
        <Text size="xs" c="dimmed">
          Shared route · {map.name}
        </Text>
        <Title order={2}>{route.name}</Title>
        <Text size="sm" c="dimmed">
          {route.hero ?? 'No hero'} · {route.steps.length} stops{build ? ` · build: ${build.name} (${build.steps.length} steps)` : ''}
        </Text>
      </div>
      <MapCanvas map={map} steps={route.steps} notes={route.mapNotes} readOnly />
      <Group>
        <Button
          onClick={() => {
            const res = importData(raw)
            if (res.routes[0]) navigate(href.route(res.routes[0].id))
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

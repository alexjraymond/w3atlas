import { ActionIcon, Badge, Card, Group, Menu, Stack, Text } from '@mantine/core'
import { IconCopy, IconDots, IconDownload, IconTrash } from '@tabler/icons-react'
import type { Route } from '../types'
import { HERO_BY_NAME, RACE_SHORT } from '../game/heroes'
import { MAP_BY_ID } from '../data/maps'
import { simulateRoute } from '../game/route'
import { href, navigate } from '../lib/router'
import { duplicateRoute, exportBundle, routes } from '../store'
import { downloadFile, fileSafe } from '../lib/files'
import { GameIcon } from './GameIcon'

function timeAgo(t: number) {
  const s = (Date.now() - t) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(t).toLocaleDateString()
}

export function RouteCard({ route, showMap }: { route: Route; showMap?: boolean }) {
  const map = MAP_BY_ID[route.mapId]
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  const level = map ? simulateRoute(map, route.steps).final.exact : 1
  return (
    <Card withBorder padding="sm" component="a" href={href.route(route.id)} style={{ cursor: 'pointer' }}>
      <Group wrap="nowrap" align="flex-start" gap="sm">
        <GameIcon name={hero?.icon ?? (route.race ?? '')} size={44} alt={route.hero ?? 'No hero'} />
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} truncate>
            {route.name || 'Untitled route'}
          </Text>
          <Group gap={4}>
            {route.race && (
              <Badge size="xs" variant="light">
                {RACE_SHORT[route.race]}v{RACE_SHORT[route.vs]}
              </Badge>
            )}
            {showMap && map && (
              <Badge size="xs" variant="outline" color="gray">
                {map.name}
              </Badge>
            )}
            <Badge size="xs" variant="light" color="yellow">
              {route.steps.length} stops · Lv {level.toFixed(1)}
            </Badge>
            {route.buildId && (
              <Badge size="xs" variant="light" color="teal">
                + build
              </Badge>
            )}
            <Badge size="xs" variant="outline" color="gray">
              {route.level}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            Edited {timeAgo(route.updatedAt)}
          </Text>
        </Stack>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Route actions"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item
              leftSection={<IconCopy size={14} />}
              onClick={(e) => {
                e.preventDefault()
                const copy = duplicateRoute(route.id)
                if (copy) navigate(href.route(copy.id))
              }}
            >
              Duplicate
            </Menu.Item>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={(e) => {
                e.preventDefault()
                downloadFile(`${fileSafe(route.name)}.json`, exportBundle([route]))
              }}
            >
              Export
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.preventDefault()
                if (confirm(`Delete "${route.name}"? This can't be undone.`)) routes.remove(route.id)
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  )
}

import { Avatar, Badge, Card, Group, Image, Rating, Stack, Text } from '@mantine/core'
import { IconMessageCircle } from '@tabler/icons-react'
import type { RouteSummary } from '../cloud/types'
import { MAP_BY_ID } from '../data/maps'
import { HERO_BY_NAME, matchupLabel } from '../game/heroes'
import { href } from '../lib/router'
import { GameIcon } from './GameIcon'

export function CommunityRouteCard({ route, showMap = true }: { route: RouteSummary; showMap?: boolean }) {
  const map = MAP_BY_ID[route.mapId]
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  return (
    <Card withBorder padding="sm" component="a" href={href.publicRoute(route.id)} className="hover-lift">
      <Group wrap="nowrap" align="flex-start" gap="sm">
        {showMap && map ? (
          <Image src={map.image} w={56} h={56} radius="sm" alt={map.name} />
        ) : (
          <GameIcon name={hero?.icon ?? route.race ?? ''} size={44} alt={route.hero ?? ''} />
        )}
        <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} truncate>
            {route.title || 'Untitled route'}
          </Text>
          <Group gap={6}>
            <Rating value={route.ratingAvg} fractions={4} readOnly size="xs" />
            <Text size="xs" c="dimmed">
              {route.ratingCount ? `${route.ratingAvg.toFixed(1)} (${route.ratingCount})` : 'no ratings yet'}
            </Text>
            {route.commentCount > 0 && (
              <Group gap={2}>
                <IconMessageCircle size={12} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed">
                  {route.commentCount}
                </Text>
              </Group>
            )}
          </Group>
          <Group gap={4}>
            {route.race && (
              <Badge size="xs" variant="light">
                {matchupLabel(route.race, route.vs)}
              </Badge>
            )}
            {hero && (
              <Badge size="xs" variant="outline" color="gray" leftSection={<GameIcon name={hero.icon} size={12} />}>
                {hero.name}
              </Badge>
            )}
            {showMap && map && (
              <Badge size="xs" variant="outline" color="gray">
                {map.name}
              </Badge>
            )}
          </Group>
          <Group gap={6}>
            <Avatar src={route.author.avatarUrl} size={16} radius="xl">
              {route.author.username.slice(0, 1).toUpperCase()}
            </Avatar>
            <Text size="xs" c="dimmed">
              {route.author.username}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

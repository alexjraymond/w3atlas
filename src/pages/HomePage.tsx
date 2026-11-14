import { Badge, Card, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { MAPS, DIFFICULTY_COLOR } from '../data/maps'
import { href } from '../lib/router'
import { useRoutes } from '../store'
import { RouteCard } from '../components/RouteCard'

export function HomePage() {
  const routes = useRoutes()
  const recent = [...routes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6)

  return (
    <Stack gap="xl" px={{ base: 'xs', sm: 0 }}>
      <div>
        <Title order={2}>Pick a map</Title>
        <Text c="dimmed" size="sm">
          Plan a build order and creep route for each map in the pool, save it, and pull it up before your game.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
        {MAPS.map((m) => {
          const count = routes.filter((r) => r.mapId === m.id).length
          const byDiff = (d: string) => m.camps.filter((c) => c.difficulty === d).length
          return (
            <Card key={m.id} component="a" href={href.map(m.id)} withBorder padding="xs" radius="md" className="hover-lift">
              <Card.Section>
                <Image src={m.image} alt={m.name} style={{ aspectRatio: '1', objectFit: 'cover' }} />
              </Card.Section>
              <Text fw={700} mt="xs" truncate>
                {m.name}
              </Text>
              <Group gap={6} mt={2} justify="space-between">
                <Group gap={6}>
                  {(['green', 'orange', 'red'] as const).map((d) => (
                    <Group key={d} gap={3}>
                      <span style={{ width: 8, height: 8, borderRadius: 8, background: DIFFICULTY_COLOR[d] }} />
                      <Text size="xs" c="dimmed">
                        {byDiff(d)}
                      </Text>
                    </Group>
                  ))}
                </Group>
                {count > 0 && (
                  <Badge size="xs" variant="light" color="yellow">
                    {count} route{count > 1 ? 's' : ''}
                  </Badge>
                )}
              </Group>
            </Card>
          )
        })}
      </SimpleGrid>

      {recent.length > 0 && (
        <div>
          <Title order={4} mb="sm">
            Recently edited
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {recent.map((r) => (
              <RouteCard key={r.id} route={r} showMap />
            ))}
          </SimpleGrid>
        </div>
      )}
    </Stack>
  )
}

import { useState, type ReactNode } from 'react'
import { Anchor, Avatar, Badge, Button, Card, Grid, Group, Image, Stack, Text, Title } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import type { Build, Route } from '../types'
import { MAP_BY_ID } from '../data/maps'
import { href } from '../lib/router'
import { CREEP_HELPER, HERO_BY_NAME, RACE_LABEL } from '../game/heroes'
import type { Author } from '../cloud/types'
import { MapCanvas } from './MapCanvas'
import { AowPathList } from './AowPath'
import { CreepRoute, XpSummary } from './CreepRoute'
import { BuildOrder } from './BuildOrder'
import { GameIcon } from './GameIcon'
import { SkillGrid } from './SkillGrid'

const ago = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

interface Props {
  route: Route
  build: Build | null | undefined
  /** buttons shown top-right (edit toggle, menu, rating summary...) */
  actions?: ReactNode
  /** who made it (public routes) */
  author?: Author
  /** link for the companion build, if it can be opened here */
  buildHref?: string
  /** extra content under the route (ratings, comments) */
  children?: ReactNode
}

/** Read-only presentation of a route: header, map, skill order, stops and companion build. */
export function RouteViewer({ route, build, actions, author, buildHref, children }: Props) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const map = MAP_BY_ID[route.mapId]
  if (!map) return null
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  const allOpen = route.steps.length > 0 && route.steps.every((s) => expanded.has(s.id))

  return (
    <Stack gap="lg" px={{ base: 'xs', sm: 0 }}>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group align="flex-start" gap="lg" wrap="nowrap" style={{ flex: 1, minWidth: 260 }}>
          <Image src={map.image} w={96} h={96} radius="md" visibleFrom="xs" alt={map.name} />
          <Stack gap={6} style={{ minWidth: 0 }}>
            <Anchor href={href.map(map.id)} size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: 1.5 }}>
              {map.name}
            </Anchor>
            <Group gap={8}>
              {route.race && (
                <Group gap={4}>
                  <GameIcon name={route.race} size={22} style={{ borderRadius: '50%' }} />
                  <Text size="sm" fw={600}>
                    {RACE_LABEL[route.race]}
                  </Text>
                </Group>
              )}
              <Text size="xs" c="dimmed">
                vs
              </Text>
              <Text size="sm">{RACE_LABEL[route.vs]}</Text>
              {hero && (
                <Group gap={4}>
                  <GameIcon name={hero.icon} size={22} />
                  <Text size="sm">{hero.name}</Text>
                </Group>
              )}
            </Group>
            <Title order={1} fz={{ base: 28, sm: 40 }} lh={1.05}>
              {route.name || 'Untitled route'}
            </Title>
            {route.notes && (
              <Text c="gray.4" style={{ whiteSpace: 'pre-wrap' }}>
                {route.notes}
              </Text>
            )}
            <Group gap={8}>
              {author && (
                <Group gap={6}>
                  <Avatar src={author.avatarUrl} size={20} radius="xl" alt={author.username}>
                    {author.username.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Text size="xs" fw={600}>
                    {author.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    ·
                  </Text>
                </Group>
              )}
              <Text size="xs" c="dimmed">
                Updated {ago(route.updatedAt)}
              </Text>
            </Group>
            <Group gap={6}>
              {route.tags.map((t) => (
                <Badge key={t} variant="default" size="sm" tt="none">
                  {t}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Group>
        {actions}
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <MapCanvas
              map={map}
              steps={route.steps}
              activeStepId={activeStep}
              onStepClick={(id) => setExpanded(new Set([...expanded, id]))}
              notes={route.mapNotes}
              readOnly
              helper={route.race ? CREEP_HELPER[route.race] : undefined}
              aowPath={route.aowPath}
            />
            {route.aowPath.length > 0 && <AowPathList path={route.aowPath} />}
            {hero && route.skills.some(Boolean) && (
              <Card withBorder padding="sm">
                <Group gap={8} mb={8}>
                  <GameIcon name={hero.icon} size={22} />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Skill order
                  </Text>
                </Group>
                <SkillGrid hero={hero} skills={route.skills} />
              </Card>
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            <XpSummary map={map} route={route} />
            <Group justify="space-between" align="center">
              <Group gap={8} align="baseline">
                <Title order={4}>Route</Title>
                <Text size="sm" c="dimmed">
                  {route.steps.length} stops
                </Text>
              </Group>
              {route.steps.length > 0 && (
                <Button size="xs" variant="subtle" onClick={() => setExpanded(allOpen ? new Set() : new Set(route.steps.map((s) => s.id)))}>
                  {allOpen ? 'Collapse all' : 'Expand all'}
                </Button>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={-6}>
              XP is what the hero earns at its level at that moment. A boxed group is killed in any order.
            </Text>
            <CreepRoute
              map={map}
              route={route}
              onStepsChange={() => {}}
              activeStepId={activeStep}
              onActiveStep={setActiveStep}
              expanded={expanded}
              onExpandedChange={setExpanded}
              readOnly
            />
          </Stack>
        </Grid.Col>
      </Grid>

      <Stack gap="sm">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={3}>Companion build</Title>
            <Text size="sm" c="dimmed">
              The build order this route is played with.
            </Text>
          </div>
          {build && buildHref && (
            <Anchor href={buildHref} size="sm">
              <Group gap={4}>
                Open build <IconExternalLink size={14} />
              </Group>
            </Anchor>
          )}
        </Group>
        {build ? (
          <Card withBorder padding="md" style={{ borderLeft: '3px solid var(--mantine-color-yellow-6)' }}>
            <Group justify="space-between" align="flex-start" mb="sm">
              <div>
                <Text fw={800}>{build.name}</Text>
                {build.notes && (
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {build.notes}
                  </Text>
                )}
              </div>
              <Badge variant="light" size="sm" color="gray">
                {build.steps.length} steps
              </Badge>
            </Group>
            <BuildOrder steps={build.steps} onChange={() => {}} readOnly />
          </Card>
        ) : (
          <Text size="sm" c="dimmed">
            No build order linked.
          </Text>
        )}
      </Stack>

      {children}
    </Stack>
  )
}

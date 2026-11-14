import { useRef, useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  CopyButton,
  Grid,
  Group,
  Image,
  Menu,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconArrowBackUp,
  IconCopy,
  IconDots,
  IconDownload,
  IconExternalLink,
  IconLink,
  IconMapPin,
  IconNote,
  IconPlus,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react'
import type { MapNote, Route } from '../types'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { builds, duplicateRoute, encodeShare, exportBundle, routes, useBuild, useBuilds, useRoute, useRoutes } from '../store'
import { newBuild, newStep, newWaypoint, uid } from '../game/route'
import { CREEP_HELPER, HERO_BY_NAME, RACE_LABEL } from '../game/heroes'
import { downloadFile, fileSafe } from '../lib/files'
import { MapCanvas } from '../components/MapCanvas'
import { HeroPanel } from '../components/HeroPanel'
import { CreepRoute, XpSummary } from '../components/CreepRoute'
import { BuildOrder } from '../components/BuildOrder'
import { GameIcon } from '../components/GameIcon'
import { SkillGrid } from '../components/SkillGrid'
import { AgainstPicker, Label } from '../components/BuildFields'
import { NotFound } from './NotFound'

const ago = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

export function RoutePage({ routeId }: { routeId: string }) {
  const route = useRoute(routeId)
  const build = useBuild(route?.buildId)
  const allBuilds = useBuilds()
  const allRoutes = useRoutes()
  const [mode, setMode] = useState<'edit' | 'view'>(() => (route && route.steps.length > 0 ? 'view' : 'edit'))
  const [placing, setPlacing] = useState<'note' | 'waypoint' | null>(null)
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  // undo history (this page visit only)
  const history = useRef<Route[]>([])
  const lastPush = useRef({ key: '', t: 0 })
  const [, force] = useState(0)

  if (!route) return <NotFound what="route" />
  const map = MAP_BY_ID[route.mapId]
  if (!map) return <NotFound what="map" />

  const readOnly = mode === 'view'

  /** Save a change. Rapid edits of the same kind (typing) collapse into one undo step. */
  const patch = (p: Partial<Route>) => {
    const key = Object.keys(p).sort().join(',')
    const now = Date.now()
    if (key !== lastPush.current.key || now - lastPush.current.t > 1200 || key === 'steps') {
      history.current = [...history.current.slice(-49), route]
      force((n) => n + 1)
    }
    lastPush.current = { key, t: now }
    routes.save({ ...route, ...p })
  }
  const undo = () => {
    const prev = history.current.pop()
    if (prev) {
      routes.put(prev)
      lastPush.current = { key: '', t: 0 }
      force((n) => n + 1)
    }
  }

  const toggleCamp = (campId: string) => {
    const exists = route.steps.find((s) => s.campId === campId)
    if (exists) patch({ steps: route.steps.filter((s) => s.id !== exists.id) })
    else {
      const step = newStep(campId)
      patch({ steps: [...route.steps, step] })
      setExpanded(new Set([step.id])) // focus the new step
    }
  }
  const setNote = (note: MapNote) => patch({ mapNotes: route.mapNotes.map((n) => (n.id === note.id ? note : n)) })
  const onPlace = (x: number, y: number) => {
    if (placing === 'waypoint') {
      const wp = newWaypoint(Math.round(x), Math.round(y))
      patch({ steps: [...route.steps, wp] })
      setExpanded(new Set([wp.id]))
    } else if (placing === 'note') {
      patch({ mapNotes: [...route.mapNotes, { id: uid(), x: (x / map.width) * 100, y: (y / map.height) * 100, text: '' }] })
    }
    setPlacing(null)
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}${href.share(encodeShare(route))}`
  const usedBy = build ? allRoutes.filter((r) => r.buildId === build.id).length : 0
  const allOpen = route.steps.length > 0 && route.steps.every((s) => expanded.has(s.id))

  // ---------- pieces ----------

  const actions = (
    <Group gap="xs" wrap="nowrap">
      {!readOnly && (
        <Button size="xs" variant="default" leftSection={<IconArrowBackUp size={14} />} disabled={!history.current.length} onClick={undo}>
          Undo
        </Button>
      )}
      <SegmentedControl
        size="xs"
        value={mode}
        onChange={(v) => {
          setMode(v as 'edit' | 'view')
          setPlacing(null)
        }}
        data={[
          { value: 'edit', label: 'Edit' },
          { value: 'view', label: 'Preview' },
        ]}
      />
      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <ActionIcon variant="default" size="md" aria-label="More actions">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <CopyButton value={shareUrl}>
            {({ copied, copy }) => (
              <Menu.Item leftSection={<IconLink size={14} />} onClick={copy} closeMenuOnClick={false}>
                {copied ? 'Link copied!' : 'Copy share link'}
              </Menu.Item>
            )}
          </CopyButton>
          <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => downloadFile(`${fileSafe(route.name)}.json`, exportBundle([route]))}>
            Export file
          </Menu.Item>
          <Menu.Item
            leftSection={<IconCopy size={14} />}
            onClick={() => {
              const c = duplicateRoute(route.id)
              if (c) navigate(href.route(c.id))
            }}
          >
            Duplicate
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => {
              if (confirm(`Delete "${route.name}"? This can't be undone.`)) {
                routes.remove(route.id)
                navigate(href.map(map.id))
              }
            }}
          >
            Delete route
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )

  const mapBlock = (
    <Stack gap="xs">
      <MapCanvas
        map={map}
        steps={route.steps}
        activeStepId={activeStep}
        onCampClick={toggleCamp}
        onStepClick={(id) => setExpanded(new Set([...expanded, id]))}
        notes={route.mapNotes}
        placing={placing}
        onPlace={onPlace}
        onChangeNote={setNote}
        onDeleteNote={(id) => patch({ mapNotes: route.mapNotes.filter((n) => n.id !== id) })}
        readOnly={readOnly}
        helper={route.race ? CREEP_HELPER[route.race] : undefined}
      />
      {!readOnly && (
        <Text size="xs" c="dimmed">
          {placing === 'waypoint'
            ? 'Click the map where the waypoint goes (shop, tavern, a spot to wait…).'
            : placing === 'note'
              ? 'Click anywhere on the map to drop the note.'
              : 'Click a camp to add it as the next stop, or click it again to remove it.'}
        </Text>
      )}
    </Stack>
  )

  const routeBlock = (
    <Stack gap="sm">
      <XpSummary map={map} route={route} />
      <Group justify="space-between" align="center">
        <Group gap={8} align="baseline">
          <Title order={4}>Route</Title>
          <Text size="sm" c="dimmed">
            {route.steps.length} stops
          </Text>
        </Group>
        <Group gap={6}>
          {!readOnly && (
            <>
              <Button
                size="xs"
                variant={placing === 'waypoint' ? 'filled' : 'default'}
                leftSection={<IconMapPin size={14} />}
                onClick={() => setPlacing((p) => (p === 'waypoint' ? null : 'waypoint'))}
              >
                {placing === 'waypoint' ? 'Cancel' : 'Waypoint'}
              </Button>
              <Button
                size="xs"
                variant={placing === 'note' ? 'filled' : 'default'}
                leftSection={<IconNote size={14} />}
                onClick={() => setPlacing((p) => (p === 'note' ? null : 'note'))}
              >
                {placing === 'note' ? 'Cancel' : 'Note'}
              </Button>
              <Tooltip label="Clear all stops and notes">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  disabled={!route.steps.length && !route.mapNotes.length}
                  onClick={() => confirm('Clear all stops and map notes?') && patch({ steps: [], mapNotes: [] })}
                  aria-label="Clear route"
                >
                  <IconRestore size={16} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
          {route.steps.length > 0 && (
            <Button size="xs" variant="subtle" onClick={() => setExpanded(allOpen ? new Set() : new Set(route.steps.map((s) => s.id)))}>
              {allOpen ? 'Collapse all' : 'Expand all'}
            </Button>
          )}
        </Group>
      </Group>
      <Text size="xs" c="dimmed" mt={-6}>
        XP is what the hero earns at its level at that moment. A boxed group is killed in any order.
      </Text>
      <CreepRoute
        map={map}
        route={route}
        onStepsChange={(steps) => patch({ steps })}
        activeStepId={activeStep}
        onActiveStep={setActiveStep}
        expanded={expanded}
        onExpandedChange={setExpanded}
        readOnly={readOnly}
      />
    </Stack>
  )

  const buildSection = (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={3}>Companion build</Title>
          <Text size="sm" c="dimmed">
            The build order this route is played with.
          </Text>
        </div>
        {build && (
          <Anchor href={href.build(build.id)} size="sm">
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
            <Group gap={4}>
              <Badge variant="light" size="sm" color="gray">
                {build.steps.length} steps
              </Badge>
            </Group>
          </Group>
          {!readOnly && usedBy > 1 && (
            <Text size="xs" c="orange" mb="xs">
              This build is shared by {usedBy} routes. Edits here change it everywhere.
            </Text>
          )}
          <BuildOrder steps={build.steps} onChange={(steps) => builds.update(build.id, { steps })} readOnly={readOnly} />
        </Card>
      ) : (
        <Text size="sm" c="dimmed">
          {readOnly ? 'No build order linked.' : 'Pick an existing build above, or create one for this route.'}
        </Text>
      )}
    </Stack>
  )

  // ---------- view mode ----------
  if (readOnly) {
    const hero = route.hero ? HERO_BY_NAME[route.hero] : null
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
              <Text size="xs" c="dimmed">
                Updated {ago(route.updatedAt)}
              </Text>
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
              {mapBlock}
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
          <Grid.Col span={{ base: 12, md: 6 }}>{routeBlock}</Grid.Col>
        </Grid>
        {buildSection}
      </Stack>
    )
  }

  // ---------- edit mode ----------
  return (
    <Stack gap="lg" px={{ base: 'xs', sm: 0 }}>
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
        <Stack gap={0} style={{ flex: 1, minWidth: 220 }}>
          <Anchor href={href.map(map.id)} size="xs" c="dimmed">
            ← {map.name}
          </Anchor>
          <TextInput
            variant="unstyled"
            value={route.name}
            placeholder="Route name, e.g. Fast level 3 AM"
            onChange={(e) => patch({ name: e.currentTarget.value })}
            styles={{ input: { fontSize: 26, fontWeight: 800, height: 38 } }}
            aria-label="Route name"
          />
        </Stack>
        {actions}
      </Group>

      <Card withBorder padding="lg">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" verticalSpacing="lg">
          <HeroPanel route={route} onChange={patch} />
          <Stack gap="md">
            <div>
              <Label>Against</Label>
              <AgainstPicker value={route.vs} onChange={(vs) => patch({ vs })} />
            </div>
            <div>
              <Label>Companion build</Label>
              <Group gap="xs" wrap="nowrap">
                <Select
                  style={{ flex: 1 }}
                  placeholder="None"
                  clearable
                  searchable
                  value={route.buildId}
                  onChange={(buildId) => patch({ buildId })}
                  data={allBuilds.map((b) => ({ value: b.id, label: `${b.name}${b.race ? ` · ${RACE_LABEL[b.race]}` : ''}` }))}
                  nothingFoundMessage="No builds yet"
                />
                <Button
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => {
                    const b = builds.save(newBuild({ name: `${route.name} build`, race: route.race, vs: route.vs }))
                    patch({ buildId: b.id })
                  }}
                >
                  New
                </Button>
              </Group>
            </div>
            <TagsInput label="Tags" placeholder="fast level 3, tower rush… (Enter to add)" value={route.tags} onChange={(tags) => patch({ tags })} />
            <Textarea
              label="Description"
              placeholder="What this route is for, timings, what to scout…"
              autosize
              minRows={2}
              maxRows={10}
              value={route.notes}
              onChange={(e) => patch({ notes: e.currentTarget.value })}
            />
          </Stack>
        </SimpleGrid>
      </Card>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>{mapBlock}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>{routeBlock}</Grid.Col>
      </Grid>

      {buildSection}
    </Stack>
  )
}

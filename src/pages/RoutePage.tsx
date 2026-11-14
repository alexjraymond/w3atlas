import { useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  CopyButton,
  Grid,
  Group,
  Menu,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core'
import {
  IconCopy,
  IconDots,
  IconDownload,
  IconEye,
  IconLink,
  IconNote,
  IconPencil,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react'
import type { MapNote, Route } from '../types'
import { MAP_BY_ID } from '../data/maps'
import { href, navigate } from '../lib/router'
import { deleteRoute, duplicateRoute, encodeShare, exportJson, updateRoute, useRoute } from '../store/routes'
import { newStep, uid } from '../game/route'
import { HERO_BY_NAME, RACE_LABEL } from '../game/heroes'
import { downloadFile, fileSafe } from '../lib/files'
import { MapCanvas } from '../components/MapCanvas'
import { HeroPanel, MatchupPicker } from '../components/HeroPanel'
import { CreepRoute, XpSummary } from '../components/CreepRoute'
import { BuildOrder } from '../components/BuildOrder'
import { GameIcon } from '../components/GameIcon'
import { NotFound } from './NotFound'

function SkillStrip({ route }: { route: Route }) {
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null
  if (!hero) return null
  return (
    <Group gap={4} wrap="nowrap">
      <GameIcon name={hero.icon} size={40} alt={hero.name} />
      <Group gap={2}>
        {route.skills.map((s, i) => {
          const a = hero.abilities.find((x) => x.name === s)
          return (
            <Tooltip key={i} label={`Level ${i + 1}: ${s || '—'}`}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <GameIcon name={a?.icon ?? ''} size={28} dim={!a} />
                <span style={{ position: 'absolute', right: 1, bottom: -2, fontSize: 9, fontWeight: 800, color: '#fff', textShadow: '0 0 2px #000,0 0 2px #000' }}>
                  {i + 1}
                </span>
              </span>
            </Tooltip>
          )
        })}
      </Group>
    </Group>
  )
}

export function RoutePage({ routeId }: { routeId: string }) {
  const route = useRoute(routeId)
  const [mode, setMode] = useState<'edit' | 'view'>(() =>
    route && (route.steps.length > 0 || route.build.length > 0) ? 'view' : 'edit',
  )
  const [placingNote, setPlacingNote] = useState(false)
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [tab, setTab] = useState<string | null>('creep')

  if (!route) return <NotFound what="route" />
  const map = MAP_BY_ID[route.mapId]
  if (!map) return <NotFound what="map" />

  const readOnly = mode === 'view'
  const patch = (p: Partial<Route>) => updateRoute(route.id, p)

  const toggleCamp = (campId: string) => {
    const exists = route.steps.find((s) => s.campId === campId)
    patch({ steps: exists ? route.steps.filter((s) => s.campId !== campId) : [...route.steps, newStep(campId)] })
  }
  const setNote = (note: MapNote) => patch({ mapNotes: route.mapNotes.map((n) => (n.id === note.id ? note : n)) })

  const shareUrl = `${window.location.origin}${window.location.pathname}${href.share(encodeShare(route))}`

  const header = (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
      <Stack gap={0} style={{ flex: 1, minWidth: 220 }}>
        <Anchor href={href.map(map.id)} size="xs" c="dimmed">
          ← {map.name}
        </Anchor>
        {readOnly ? (
          <Text fz={24} fw={800} lh={1.2}>
            {route.name || 'Untitled route'}
          </Text>
        ) : (
          <TextInput
            variant="unstyled"
            value={route.name}
            placeholder="Route name"
            onChange={(e) => patch({ name: e.currentTarget.value })}
            styles={{ input: { fontSize: 24, fontWeight: 800, height: 34 } }}
            aria-label="Route name"
          />
        )}
      </Stack>
      <Group gap="xs" wrap="nowrap">
        <SegmentedControl
          size="xs"
          value={mode}
          onChange={(v) => {
            setMode(v as 'edit' | 'view')
            setPlacingNote(false)
          }}
          data={[
            { value: 'view', label: <Group gap={4} wrap="nowrap"><IconEye size={14} />View</Group> },
            { value: 'edit', label: <Group gap={4} wrap="nowrap"><IconPencil size={14} />Edit</Group> },
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
            <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => downloadFile(`${fileSafe(route.name)}.json`, exportJson([route]))}>
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
                  deleteRoute(route.id)
                  navigate(href.map(map.id))
                }
              }}
            >
              Delete route
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  )

  const mapBlock = (
    <Stack gap="xs">
      <MapCanvas
        map={map}
        steps={route.steps}
        activeStepId={activeStep}
        onCampClick={toggleCamp}
        notes={route.mapNotes}
        placingNote={placingNote}
        onAddNote={(x, y) => {
          patch({ mapNotes: [...route.mapNotes, { id: uid(), x, y, text: '' }] })
          setPlacingNote(false)
        }}
        onChangeNote={setNote}
        onDeleteNote={(id) => patch({ mapNotes: route.mapNotes.filter((n) => n.id !== id) })}
        readOnly={readOnly}
      />
      {!readOnly && (
        <Group justify="space-between" gap="xs">
          <Text size="xs" c="dimmed">
            {placingNote ? 'Click anywhere on the map to drop the note.' : 'Click a camp to add or remove it from the route.'}
          </Text>
          <Group gap="xs">
            <Button
              size="xs"
              variant={placingNote ? 'filled' : 'light'}
              color="yellow"
              leftSection={<IconNote size={14} />}
              onClick={() => setPlacingNote((p) => !p)}
            >
              {placingNote ? 'Cancel' : 'Map note'}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<IconRestore size={14} />}
              disabled={!route.steps.length && !route.mapNotes.length}
              onClick={() => confirm('Clear the creep route and map notes?') && patch({ steps: [], mapNotes: [] })}
            >
              Clear map
            </Button>
          </Group>
        </Group>
      )}
    </Stack>
  )

  const routeTabs = (
    <Tabs value={tab} onChange={setTab} keepMounted={false}>
      <Tabs.List grow>
        <Tabs.Tab value="creep">
          Creep route{' '}
          <Badge size="xs" variant="light" ml={4}>
            {route.steps.length}
          </Badge>
        </Tabs.Tab>
        <Tabs.Tab value="build">
          Build order{' '}
          <Badge size="xs" variant="light" ml={4}>
            {route.build.length}
          </Badge>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="creep" pt="sm">
        <CreepRoute
          map={map}
          route={route}
          onStepsChange={(steps) => patch({ steps })}
          activeStepId={activeStep}
          onActiveStep={setActiveStep}
          readOnly={readOnly}
        />
      </Tabs.Panel>
      <Tabs.Panel value="build" pt="sm">
        <BuildOrder steps={route.build} onChange={(build) => patch({ build })} readOnly={readOnly} />
      </Tabs.Panel>
    </Tabs>
  )

  if (readOnly) {
    return (
      <Stack gap="md" px={{ base: 'xs', sm: 0 }}>
        {header}
        <Group gap="md">
          <SkillStrip route={route} />
          {route.race && (
            <Badge variant="light" size="lg">
              {RACE_LABEL[route.race]} vs {RACE_LABEL[route.vs]}
            </Badge>
          )}
        </Group>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 7 }}>{mapBlock}</Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="sm">
              {route.steps.length > 0 && <XpSummary map={map} route={route} />}
              {route.notes && (
                <Card withBorder padding="sm">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                    Notes
                  </Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {route.notes}
                  </Text>
                </Card>
              )}
              {routeTabs}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack gap="md" px={{ base: 'xs', sm: 0 }}>
      {header}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, sm: 5, lg: 3 }} order={{ base: 2, lg: 1 }}>
          <Stack gap="md">
            <HeroPanel route={route} onChange={patch} />
            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                Opponent
              </Text>
              <MatchupPicker value={route.vs} onChange={(vs) => patch({ vs })} />
            </div>
            <Textarea
              label="Notes"
              description="Strategy, timings, what to scout…"
              autosize
              minRows={3}
              maxRows={12}
              value={route.notes}
              onChange={(e) => patch({ notes: e.currentTarget.value })}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }} order={{ base: 1, lg: 2 }}>
          {mapBlock}
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 7, lg: 4 }} order={{ base: 3 }}>
          <Stack gap="sm">
            <XpSummary map={map} route={route} />
            {routeTabs}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

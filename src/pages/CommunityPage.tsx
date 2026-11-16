import { useEffect, useState } from 'react'
import { Alert, Button, Group, Loader, Pagination, SegmentedControl, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { cloud, PAGE_SIZE, type RouteFilters, type RouteSummary } from '../cloud'
import { POOL_MAPS } from '../data/maps'
import { HEROES, RACES } from '../game/heroes'
import { href, navigate } from '../lib/router'
import type { Matchup, Race } from '../types'
import { CommunityRouteCard } from '../components/CommunityRouteCard'
import { Label } from '../components/BuildFields'

/** Filters live in the URL (#/community?map=..&race=..) so a filtered view can be shared. */
function filtersFrom(q: URLSearchParams): RouteFilters {
  return {
    mapId: q.get('map') ?? undefined,
    race: (q.get('race') as Race) ?? undefined,
    vs: (q.get('vs') as Matchup) ?? undefined,
    hero: q.get('hero') ?? undefined,
    search: q.get('q') ?? undefined,
    sort: q.get('sort') === 'new' ? 'new' : 'top',
    page: Math.max(0, Number(q.get('page') ?? 1) - 1),
  }
}

export function CommunityPage({ query }: { query: URLSearchParams }) {
  const f = filtersFrom(query)
  const [search, setSearch] = useState(f.search ?? '')
  const [result, setResult] = useState<{ items: RouteSummary[]; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const key = query.toString()

  useEffect(() => {
    if (!cloud) return
    let alive = true
    setResult(null)
    setError(null)
    cloud
      .listRoutes(filtersFrom(new URLSearchParams(key)))
      .then((r) => alive && setResult(r))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      alive = false
    }
  }, [key])

  const go = (patch: Record<string, string | undefined>) => {
    const next = { map: f.mapId, race: f.race, vs: f.vs, hero: f.hero, q: f.search, sort: f.sort === 'new' ? 'new' : undefined, ...patch }
    if (!('page' in patch)) delete (next as Record<string, unknown>).page
    navigate(href.community(next))
  }

  if (!cloud)
    return (
      <Alert color="gray" title="Community isn't set up">
        Sharing routes needs the online backend (see SETUP.md).
      </Alert>
    )

  const heroes = HEROES.filter((h) => !f.race || h.race === f.race || h.race === 'neutral')
  return (
    <Stack gap="md" px={{ base: 'xs', sm: 0 }}>
      <div>
        <Title order={2}>Community routes</Title>
        <Text size="sm" c="dimmed">
          Routes other players have made public. Open one to rate it, comment, or save a copy.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
        <div>
          <Label>Map</Label>
          <Select
            placeholder="Any map"
            clearable
            value={f.mapId ?? null}
            onChange={(v) => go({ map: v ?? undefined })}
            data={POOL_MAPS.map((m) => ({ value: m.id, label: m.name }))}
          />
        </div>
        <div>
          <Label>Race</Label>
          <Select
            placeholder="Any race"
            clearable
            value={f.race ?? null}
            onChange={(v) => go({ race: v ?? undefined, hero: undefined })}
            data={RACES.map((r) => ({ value: r.id, label: r.label }))}
          />
        </div>
        <div>
          <Label>Against</Label>
          <Select
            placeholder="Any opponent"
            clearable
            value={f.vs ?? null}
            onChange={(v) => go({ vs: v ?? undefined })}
            data={RACES.map((r) => ({ value: r.id, label: r.label }))}
          />
        </div>
        <div>
          <Label>Hero</Label>
          <Select placeholder="Any hero" clearable searchable value={f.hero ?? null} onChange={(v) => go({ hero: v ?? undefined })} data={heroes.map((h) => h.name)} />
        </div>
      </SimpleGrid>

      <Group justify="space-between" gap="sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            go({ q: search.trim() || undefined })
          }}
          style={{ flex: 1, maxWidth: 420 }}
        >
          <TextInput placeholder="Search titles…" leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
        </form>
        <SegmentedControl
          size="xs"
          value={f.sort}
          onChange={(v) => go({ sort: v === 'new' ? 'new' : undefined })}
          data={[
            { value: 'top', label: 'Top rated' },
            { value: 'new', label: 'Newest' },
          ]}
        />
      </Group>

      {error && (
        <Alert color="red" title="Couldn't load routes">
          {error}
        </Alert>
      )}
      {!result && !error && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}
      {result && !result.items.length && (
        <Stack align="center" py="xl" gap="xs">
          <Text c="dimmed">No public routes match these filters yet.</Text>
          {(f.mapId || f.race || f.vs || f.hero || f.search) && (
            <Button variant="subtle" size="xs" onClick={() => navigate(href.community())}>
              Clear filters
            </Button>
          )}
        </Stack>
      )}
      {result && result.items.length > 0 && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
            {result.items.map((r) => (
              <CommunityRouteCard key={r.id} route={r} />
            ))}
          </SimpleGrid>
          {result.total > PAGE_SIZE && (
            <Group justify="center">
              <Pagination total={Math.ceil(result.total / PAGE_SIZE)} value={f.page + 1} onChange={(p) => go({ page: String(p) })} />
            </Group>
          )}
        </>
      )}
    </Stack>
  )
}

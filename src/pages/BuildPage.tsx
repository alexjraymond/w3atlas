import { useState } from 'react'
import { Anchor, Badge, Card, Group, SegmentedControl, SimpleGrid, Stack, TagsInput, Text, Textarea, TextInput, Title } from '@mantine/core'
import { builds, useBuild, useRoutes } from '../store'
import { href } from '../lib/router'
import { RACE_LABEL } from '../game/heroes'
import { BuildOrder } from '../components/BuildOrder'
import { RacePicker } from '../components/HeroPanel'
import { AgainstPicker, Label } from '../components/BuildFields'
import { RouteCard } from '../components/RouteCard'
import { NotFound } from './NotFound'

export function BuildPage({ buildId }: { buildId: string }) {
  const build = useBuild(buildId)
  const routes = useRoutes()
  const [mode, setMode] = useState<'edit' | 'view'>(() => (build && build.steps.length ? 'view' : 'edit'))
  if (!build) return <NotFound what="build" />

  const patch = (p: Parameters<typeof builds.update>[1]) => builds.update(build.id, p)
  const linked = routes.filter((r) => r.buildId === build.id)
  const readOnly = mode === 'view'

  return (
    <Stack gap="lg" px={{ base: 'xs', sm: 0 }} maw={900}>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2} style={{ flex: 1, minWidth: 220 }}>
          <Anchor href={href.builds()} size="xs" c="dimmed">
            ← Build orders
          </Anchor>
          {readOnly ? (
            <>
              <Title order={1} fz={{ base: 26, sm: 34 }}>
                {build.name || 'Untitled build'}
              </Title>
              <Group gap={6}>
                {build.race && <Badge variant="light">{RACE_LABEL[build.race]}</Badge>}
                <Text size="xs" c="dimmed">
                  vs
                </Text>
                <Badge variant="light" color="gray">
                  {RACE_LABEL[build.vs]}
                </Badge>
                {build.tags.map((t) => (
                  <Badge key={t} variant="default" tt="none">
                    {t}
                  </Badge>
                ))}
              </Group>
            </>
          ) : (
            <TextInput
              variant="unstyled"
              value={build.name}
              placeholder="Build name"
              onChange={(e) => patch({ name: e.currentTarget.value })}
              styles={{ input: { fontSize: 26, fontWeight: 800, height: 38 } }}
              aria-label="Build name"
            />
          )}
        </Stack>
        <SegmentedControl
          size="xs"
          value={mode}
          onChange={(v) => setMode(v as typeof mode)}
          data={[
            { value: 'edit', label: 'Edit' },
            { value: 'view', label: 'Preview' },
          ]}
        />
      </Group>

      {readOnly ? (
        build.notes && (
          <Text c="gray.4" style={{ whiteSpace: 'pre-wrap' }}>
            {build.notes}
          </Text>
        )
      ) : (
        <Card withBorder padding="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <div>
              <Label>Your race</Label>
              <RacePicker value={build.race} onChange={(race) => patch({ race })} />
            </div>
            <div>
              <Label>Against</Label>
              <AgainstPicker value={build.vs} onChange={(vs) => patch({ vs })} />
            </div>
            <TagsInput label="Tags" placeholder="footmen, fast expo… (Enter to add)" value={build.tags} onChange={(tags) => patch({ tags })} />
          </SimpleGrid>
          <Textarea
            mt="md"
            label="Description"
            placeholder="The idea of the build, key timings, what to adapt…"
            autosize
            minRows={2}
            value={build.notes}
            onChange={(e) => patch({ notes: e.currentTarget.value })}
          />
        </Card>
      )}

      <div>
        <Title order={4} mb="xs">
          Steps
        </Title>
        <BuildOrder steps={build.steps} onChange={(steps) => patch({ steps })} readOnly={readOnly} />
      </div>

      <div>
        <Title order={4} mb="xs">
          Used by {linked.length} route{linked.length === 1 ? '' : 's'}
        </Title>
        {linked.length ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {linked.map((r) => (
              <RouteCard key={r.id} route={r} showMap />
            ))}
          </SimpleGrid>
        ) : (
          <Text size="sm" c="dimmed">
            Link this build from a route's "Companion build" field.
          </Text>
        )}
      </div>
    </Stack>
  )
}

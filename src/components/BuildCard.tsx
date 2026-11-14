import { ActionIcon, Badge, Card, Group, Menu, Stack, Text } from '@mantine/core'
import { IconCopy, IconDots, IconTrash } from '@tabler/icons-react'
import type { Build } from '../types'
import { RACE_LABEL } from '../game/heroes'
import { href, navigate } from '../lib/router'
import { deleteBuild, duplicateBuild } from '../store'
import { GameIcon } from './GameIcon'

export function BuildCard({ build, usedBy = 0 }: { build: Build; usedBy?: number }) {
  return (
    <Card withBorder padding="sm" component="a" href={href.build(build.id)} style={{ borderLeft: '3px solid var(--mantine-color-yellow-7)' }}>
      <Group wrap="nowrap" align="flex-start" gap="sm">
        <GameIcon name={build.race ?? ''} size={40} alt={build.race ?? 'Any race'} style={{ borderRadius: '50%' }} />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} truncate>
            {build.name || 'Untitled build'}
          </Text>
          {build.notes && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {build.notes}
            </Text>
          )}
          <Group gap={4}>
            <Badge size="xs" variant="light">
              vs {RACE_LABEL[build.vs]}
            </Badge>
            <Badge size="xs" variant="light" color="gray">
              {build.steps.length} steps
            </Badge>
            {usedBy > 0 && (
              <Badge size="xs" variant="light" color="teal">
                {usedBy} route{usedBy > 1 ? 's' : ''}
              </Badge>
            )}
            {build.tags.map((t) => (
              <Badge key={t} size="xs" variant="default" tt="none">
                {t}
              </Badge>
            ))}
          </Group>
        </Stack>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Build actions"
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
                const b = duplicateBuild(build.id)
                if (b) navigate(href.build(b.id))
              }}
            >
              Duplicate
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.preventDefault()
                if (confirm(`Delete "${build.name}"?${usedBy ? ` It will be unlinked from ${usedBy} route(s).` : ''}`)) deleteBuild(build.id)
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

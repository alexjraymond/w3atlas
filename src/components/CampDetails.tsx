import { Badge, Group, Stack, Table, Text } from '@mantine/core'
import type { Camp } from '../types'
import { campDrops, campRawXp, DIFFICULTY_COLOR, DIFFICULTY_LABEL, iconSlug, itemName, LOOT_COLOR, LOOT_LABEL } from '../data/maps'
import { creepXp } from '../game/xp'
import { GameIcon } from './GameIcon'

export function DifficultyDot({ camp, size = 10 }: { camp: Camp; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: DIFFICULTY_COLOR[camp.difficulty],
        flexShrink: 0,
      }}
    />
  )
}

export function DropBadges({ camp }: { camp: Camp }) {
  const drops = campDrops(camp)
  if (!drops.length) return null
  return (
    <Group gap={4}>
      {drops.map((d, i) => (
        <Badge key={i} size="xs" variant="light" color={LOOT_COLOR[d.type]}>
          L{d.level} {LOOT_LABEL[d.type]}
        </Badge>
      ))}
    </Group>
  )
}

/** Full info card for a creep camp: creeps, XP and drop tables. */
export function CampDetails({ camp }: { camp: Camp }) {
  const drops = campDrops(camp)
  return (
    <Stack gap={8} w={300}>
      <div>
        <Group gap={6} wrap="nowrap">
          <DifficultyDot camp={camp} />
          <Text fw={700} size="sm">
            {camp.title}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {camp.name} · {DIFFICULTY_LABEL[camp.difficulty]} · Lv {camp.level} · {campRawXp(camp)} raw XP
        </Text>
      </div>

      <Table withRowBorders={false} verticalSpacing={2} horizontalSpacing={4} fz="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Creep</Table.Th>
            <Table.Th ta="right">Lvl</Table.Th>
            <Table.Th ta="right">XP</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {camp.units.map((u, i) => (
            <Table.Tr key={i}>
              <Table.Td>
                <Group gap={6} wrap="nowrap">
                  <GameIcon name={iconSlug(u.name)} size={20} alt={u.name} />
                  <span>
                    {u.count > 1 && `${u.count}× `}
                    {u.name}
                    {u.loot && <span style={{ color: '#ff8787' }}> ◆</span>}
                  </span>
                </Group>
              </Table.Td>
              <Table.Td ta="right">{u.level}</Table.Td>
              <Table.Td ta="right">{creepXp(u.level) * u.count}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {drops.length > 0 && (
        <Stack gap={6}>
          {drops.map((d, i) => (
            <div key={i}>
              <Group gap={6} mb={4}>
                <Badge size="xs" color={LOOT_COLOR[d.type]} variant="light">
                  Level {d.level} {LOOT_LABEL[d.type]}
                </Badge>
                <Text size="xs" c="dimmed">
                  from {d.from}
                </Text>
              </Group>
              {d.items.length > 0 && (
                <Group gap={4}>
                  {d.items.map((item) => (
                    <GameIcon key={item} name={iconSlug(item)} size={24} alt={itemName(item)} />
                  ))}
                </Group>
              )}
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

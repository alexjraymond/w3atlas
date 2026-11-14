import { useEffect, useRef, useState } from 'react'
import { ActionIcon, Button, CopyButton, Group, Modal, Stack, Table, Text, Textarea, TextInput } from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconClipboardText, IconCopy, IconPlus, IconTrash } from '@tabler/icons-react'
import type { BuildStep } from '../types'
import { buildOrderToText, parseBuildOrder, uid } from '../game/route'

interface Props {
  steps: BuildStep[]
  onChange: (steps: BuildStep[]) => void
  readOnly?: boolean
}

function nextSupply(prev: string | undefined): string {
  if (!prev) return ''
  const m = prev.match(/^(\d+)(\/\d+)?$/)
  return m ? String(Number(m[1]) + 1) + (m[2] ?? '') : prev
}

export function BuildOrder({ steps, onChange, readOnly }: Props) {
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const focusId = useRef<string | null>(null)
  const inputs = useRef(new Map<string, HTMLInputElement>())

  useEffect(() => {
    if (focusId.current) {
      inputs.current.get(focusId.current)?.focus()
      focusId.current = null
    }
  })

  const update = (id: string, patch: Partial<BuildStep>) => onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const insertAfter = (index: number) => {
    const s: BuildStep = { id: uid(), supply: nextSupply(steps[index]?.supply), time: '', action: '' }
    const next = [...steps]
    next.splice(index + 1, 0, s)
    focusId.current = s.id
    onChange(next)
  }
  const move = (i: number, dir: -1 | 1) => {
    const next = [...steps]
    const [s] = next.splice(i, 1)
    next.splice(i + dir, 0, s)
    onChange(next)
  }

  if (readOnly) {
    return steps.length ? (
      <Table fz="sm" verticalSpacing={4} striped>
        <Table.Tbody>
          {steps.map((s) => (
            <Table.Tr key={s.id}>
              <Table.Td w={48} c="yellow" fw={700}>
                {s.supply}
              </Table.Td>
              <Table.Td w={48} c="dimmed">
                {s.time}
              </Table.Td>
              <Table.Td>{s.action}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    ) : (
      <Text size="sm" c="dimmed" ta="center" py="lg">
        No build order.
      </Text>
    )
  }

  return (
    <Stack gap={8}>
      {steps.length > 0 && (
        <Table verticalSpacing={2} horizontalSpacing={2} withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={58} fz="xs" c="dimmed">
                Supply
              </Table.Th>
              <Table.Th w={58} fz="xs" c="dimmed">
                Time
              </Table.Th>
              <Table.Th fz="xs" c="dimmed">
                Action
              </Table.Th>
              <Table.Th w={70} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {steps.map((s, i) => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  <TextInput size="xs" value={s.supply} placeholder="—" aria-label="Supply" onChange={(e) => update(s.id, { supply: e.currentTarget.value })} styles={{ input: { color: 'var(--mantine-color-yellow-4)', fontWeight: 700 } }} />
                </Table.Td>
                <Table.Td>
                  <TextInput size="xs" value={s.time} placeholder="m:ss" aria-label="Time" onChange={(e) => update(s.id, { time: e.currentTarget.value })} />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    size="xs"
                    ref={(el) => {
                      if (el) inputs.current.set(s.id, el)
                      else inputs.current.delete(s.id)
                    }}
                    value={s.action}
                    placeholder="Altar / Hero / Farm…"
                    aria-label="Action"
                    onChange={(e) => update(s.id, { action: e.currentTarget.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        insertAfter(i)
                      } else if (e.key === 'Backspace' && !s.action && !s.supply && !s.time && steps.length > 0) {
                        e.preventDefault()
                        if (i > 0) focusId.current = steps[i - 1].id
                        onChange(steps.filter((x) => x.id !== s.id))
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={0} wrap="nowrap">
                    <ActionIcon size="sm" variant="subtle" color="gray" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                      <IconArrowUp size={13} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="gray" disabled={i === steps.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                      <IconArrowDown size={13} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => onChange(steps.filter((x) => x.id !== s.id))} aria-label="Delete">
                      <IconTrash size={13} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {!steps.length && (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          Add steps one by one (Enter adds the next line), or paste a whole build.
        </Text>
      )}

      <Group gap="xs">
        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={() => insertAfter(steps.length - 1)}>
          Add step
        </Button>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconClipboardText size={14} />}
          onClick={() => {
            setPasteText(buildOrderToText(steps))
            setPasteOpen(true)
          }}
        >
          Edit as text
        </Button>
        {steps.length > 0 && (
          <CopyButton value={buildOrderToText(steps)}>
            {({ copied, copy }) => (
              <Button size="xs" variant="subtle" color={copied ? 'teal' : 'gray'} leftSection={<IconCopy size={14} />} onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CopyButton>
        )}
      </Group>

      <Modal opened={pasteOpen} onClose={() => setPasteOpen(false)} title="Build order as text" size="lg">
        <Text size="xs" c="dimmed" mb="xs">
          One step per line: <code>supply action</code>, optionally starting with a time. E.g. <code>5 Altar</code>,{' '}
          <code>6 - Barracks</code>, <code>2:10 12 Hero 2</code>.
        </Text>
        <Textarea autosize minRows={10} maxRows={24} value={pasteText} onChange={(e) => setPasteText(e.currentTarget.value)} styles={{ input: { fontFamily: 'monospace' } }} />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setPasteOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onChange(parseBuildOrder(pasteText))
              setPasteOpen(false)
            }}
          >
            Replace build order
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}

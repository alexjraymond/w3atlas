import { useCallback, useEffect, useState } from 'react'
import { ActionIcon, Alert, Avatar, Button, Card, Group, Loader, Rating, Stack, Text, Textarea, Title, Tooltip } from '@mantine/core'
import { IconCopy, IconPencil, IconTrash } from '@tabler/icons-react'
import { cloud, type Comment, type RouteDetail } from '../cloud'
import { useAccount } from '../cloud/sync'
import { SignInMenu } from '../components/AccountMenu'
import { importData } from '../store'
import { href, navigate } from '../lib/router'
import { RouteViewer } from '../components/RouteViewer'
import { NotFound } from './NotFound'

const when = (t: number) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function RatingBox({ detail, onChanged }: { detail: RouteDetail; onChanged: () => void }) {
  const { user } = useAccount()
  const [mine, setMine] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const own = user?.id === detail.summary.author.id
  const routeId = detail.summary.id

  useEffect(() => {
    if (user && cloud) void cloud.myRating(routeId).then(setMine)
    else setMine(null)
  }, [user, routeId])

  const rate = async (stars: number) => {
    if (!cloud) return
    setBusy(true)
    setError(null)
    try {
      const next = stars === mine ? null : stars // clicking your current rating clears it
      await cloud.rate(routeId, next)
      setMine(next)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const s = detail.summary
  return (
    <Card withBorder padding="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group gap="sm">
          <Text fz={32} fw={800} lh={1}>
            {s.ratingCount ? s.ratingAvg.toFixed(1) : '–'}
          </Text>
          <Stack gap={2}>
            <Rating value={s.ratingAvg} fractions={4} readOnly />
            <Text size="xs" c="dimmed">
              {s.ratingCount} rating{s.ratingCount === 1 ? '' : 's'}
            </Text>
          </Stack>
        </Group>
        {own ? (
          <Text size="sm" c="dimmed">
            This is your route.
          </Text>
        ) : user ? (
          <Stack gap={2} align="flex-end">
            <Text size="xs" c="dimmed">
              {mine ? 'Your rating (click it again to remove)' : 'Rate this route'}
            </Text>
            <Rating value={mine ?? 0} onChange={(v) => void rate(v)} readOnly={busy} size="lg" />
          </Stack>
        ) : (
          <SignInMenu label="Sign in to rate routes">
            <Button variant="light" size="xs">
              Sign in to rate
            </Button>
          </SignInMenu>
        )}
      </Group>
      {error && (
        <Text size="xs" c="red" mt="xs">
          {error}
        </Text>
      )}
    </Card>
  )
}

function Comments({ detail, onChanged }: { detail: RouteDetail; onChanged: () => void }) {
  const { user } = useAccount()
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const routeId = detail.summary.id
  const isOwner = user?.id === detail.summary.author.id

  const load = useCallback(() => {
    void cloud?.listComments(routeId).then(setComments)
  }, [routeId])
  useEffect(load, [load])

  const post = async () => {
    if (!cloud || !body.trim()) return
    setBusy(true)
    setError(null)
    try {
      await cloud.addComment(routeId, body.trim())
      setBody('')
      load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (!cloud || !confirm('Delete this comment?')) return
    await cloud.deleteComment(id)
    load()
    onChanged()
  }

  return (
    <Stack gap="sm">
      <Title order={3}>Comments {comments ? `(${comments.length})` : ''}</Title>
      {!comments && <Loader size="sm" />}
      {comments?.length === 0 && (
        <Text size="sm" c="dimmed">
          No comments yet.
        </Text>
      )}
      {comments?.map((c) => (
        <Card key={c.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Avatar src={c.author.avatarUrl} size={28} radius="xl">
                {c.author.username.slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Group gap={6}>
                  <Text size="sm" fw={700}>
                    {c.author.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {when(c.createdAt)}
                  </Text>
                </Group>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {c.body}
                </Text>
              </div>
            </Group>
            {user && (user.id === c.author.id || isOwner) && (
              <Tooltip label="Delete comment">
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => void remove(c.id)} aria-label="Delete comment">
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Card>
      ))}
      {user ? (
        <Stack gap={6}>
          <Textarea
            placeholder="Ask a question or share a tip…"
            autosize
            minRows={2}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
          />
          <Group justify="space-between">
            <Text size="xs" c="red">
              {error}
            </Text>
            <Button size="xs" onClick={() => void post()} loading={busy} disabled={!body.trim()}>
              Post comment
            </Button>
          </Group>
        </Stack>
      ) : (
        <div>
          <SignInMenu label="Sign in to comment">
            <Button variant="light" size="xs">
              Sign in to comment
            </Button>
          </SignInMenu>
        </div>
      )}
    </Stack>
  )
}

export function PublicRoutePage({ routeId }: { routeId: string }) {
  const { user } = useAccount()
  const [detail, setDetail] = useState<RouteDetail | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!cloud) return
    cloud
      .getRoute(routeId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [routeId])
  useEffect(load, [load, user?.id])

  if (!cloud) return <NotFound what="route" />
  if (error)
    return (
      <Alert color="red" title="Couldn't load this route">
        {error}
      </Alert>
    )
  if (detail === undefined)
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    )
  if (!detail) return <NotFound what="route" />

  const own = user?.id === detail.summary.author.id
  const saveCopy = () => {
    const res = importData({ routes: [{ ...detail.route, name: `${detail.route.name} (copy)` }], builds: detail.build ? [detail.build] : [] })
    if (res.routes[0]) navigate(href.route(res.routes[0].id))
  }

  const actions = own ? (
    <Button leftSection={<IconPencil size={16} />} component="a" href={href.route(detail.route.id)}>
      Edit
    </Button>
  ) : (
    <Tooltip label="Copy this route (and its build) into your routes to tweak it">
      <Button variant="light" leftSection={<IconCopy size={16} />} onClick={saveCopy}>
        Save a copy
      </Button>
    </Tooltip>
  )

  return (
    <RouteViewer route={detail.route} build={detail.build} author={detail.summary.author} actions={actions}>
      <Stack gap="lg" maw={760}>
        {!detail.summary.isPublic && (
          <Alert color="gray">This route is private: only you can see it. Turn on "Public" in the editor to share it.</Alert>
        )}
        <RatingBox detail={detail} onChanged={load} />
        <Comments detail={detail} onChanged={load} />
      </Stack>
    </RouteViewer>
  )
}

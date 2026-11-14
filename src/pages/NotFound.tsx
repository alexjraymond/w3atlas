import { Anchor, Stack, Text, Title } from '@mantine/core'
import { href } from '../lib/router'

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <Stack align="center" py={80} gap="xs">
      <Title order={3}>That {what} doesn't exist</Title>
      <Text c="dimmed" size="sm">
        It may have been deleted, or it was saved in a different browser.
      </Text>
      <Anchor href={href.home()}>Back to maps</Anchor>
    </Stack>
  )
}

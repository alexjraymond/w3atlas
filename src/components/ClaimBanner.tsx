import { Alert, Button, Group, Text } from '@mantine/core'
import { IconCloudUpload } from '@tabler/icons-react'
import { claimLocal, useAccount, useLocalOnlyCount } from '../cloud/sync'

/** Offers to move routes/builds made while signed out into the signed-in account. */
export function ClaimBanner() {
  const { user } = useAccount()
  const count = useLocalOnlyCount()
  if (!user || !count) return null
  return (
    <Alert variant="light" color="yellow" icon={<IconCloudUpload size={18} />}>
      <Group justify="space-between" gap="sm">
        <Text size="sm">
          {count} route{count === 1 ? '' : 's'}/build{count === 1 ? '' : 's'} are only saved in this browser. Add them to your account to keep them
          everywhere and share them.
        </Text>
        <Button size="xs" onClick={() => claimLocal()}>
          Add to my account
        </Button>
      </Group>
    </Alert>
  )
}

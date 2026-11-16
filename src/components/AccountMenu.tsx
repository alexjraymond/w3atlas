import type { ReactNode } from 'react'
import { Avatar, Button, Group, Loader, Menu, Text, UnstyledButton } from '@mantine/core'
import { IconBrandDiscord, IconBrandGoogle, IconBrandTwitch, IconCloudCheck, IconCloudX, IconLogout, IconRefresh } from '@tabler/icons-react'
import { cloud } from '../cloud'
import { retrySync, signIn, signOut, useAccount } from '../cloud/sync'

/** "Sign in" with a choice of provider; `children` is the button. */
export function SignInMenu({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <Menu position="bottom-end" shadow="md" width={210}>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{label ?? 'Save routes to your account, share them, rate others'}</Menu.Label>
        <Menu.Item leftSection={<IconBrandDiscord size={16} color="#5865F2" />} onClick={() => void signIn('discord')}>
          Continue with Discord
        </Menu.Item>
        <Menu.Item leftSection={<IconBrandTwitch size={16} color="#9146FF" />} onClick={() => void signIn('twitch')}>
          Continue with Twitch
        </Menu.Item>
        <Menu.Item leftSection={<IconBrandGoogle size={16} />} onClick={() => void signIn('google')}>
          Continue with Google
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

/** Header control: sign in (Discord / Twitch / Google) or the signed-in user with sync status. */
export function AccountMenu() {
  const { user, status, error, ready } = useAccount()
  if (!cloud) return null
  if (!ready) return <Loader size="xs" />

  if (!user)
    return (
      <SignInMenu>
        <Button size="compact-sm" variant="light">
          Sign in
        </Button>
      </SignInMenu>
    )

  const statusLine =
    status === 'syncing' ? (
      <Group gap={6}>
        <Loader size={10} /> Saving…
      </Group>
    ) : status === 'error' ? (
      <Group gap={6} c="red">
        <IconCloudX size={14} /> Not saved: {error}
      </Group>
    ) : (
      <Group gap={6} c="teal">
        <IconCloudCheck size={14} /> Saved to your account
      </Group>
    )

  return (
    <Menu position="bottom-end" shadow="md" width={240}>
      <Menu.Target>
        <UnstyledButton aria-label="Account">
          <Group gap={6} wrap="nowrap">
            <Avatar src={user.avatarUrl} size={28} radius="xl" alt={user.username}>
              {user.username.slice(0, 1).toUpperCase()}
            </Avatar>
            {status === 'syncing' && <Loader size={10} />}
            {status === 'error' && <IconCloudX size={14} color="var(--mantine-color-red-5)" />}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={700} c="var(--mantine-color-text)">
            {user.username}
          </Text>
          <Text size="xs" component="div" mt={2}>
            {statusLine}
          </Text>
        </Menu.Label>
        {status === 'error' && (
          <Menu.Item leftSection={<IconRefresh size={14} />} onClick={retrySync}>
            Try saving again
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item leftSection={<IconLogout size={14} />} onClick={() => void signOut()}>
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

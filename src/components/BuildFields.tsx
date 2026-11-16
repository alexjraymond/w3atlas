import { Text } from '@mantine/core'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text ff="var(--w-display)" fz={13} fw={700} lh={1.4} mb={6}>
      {children}
    </Text>
  )
}

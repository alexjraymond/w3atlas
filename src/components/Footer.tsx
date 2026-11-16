import { Anchor, Container, Group, Text } from '@mantine/core'
import { IconHeart } from '@tabler/icons-react'

/** Open-source projects W3Atlas is built on. `sponsor` links where the project takes donations. */
const CREDITS: { name: string; what: string; url: string; sponsor?: string }[] = [
  { name: 'Mantine', what: 'UI components', url: 'https://github.com/mantinedev/mantine', sponsor: 'https://opencollective.com/mantinedev' },
  { name: 'Vite', what: 'dev server and build', url: 'https://github.com/vitejs/vite', sponsor: 'https://github.com/sponsors/vitejs' },
  { name: 'React', what: 'UI library', url: 'https://github.com/facebook/react' },
  { name: 'Supabase', what: 'accounts and sync', url: 'https://github.com/supabase/supabase-js' },
  { name: 'Tabler Icons', what: 'interface icons', url: 'https://github.com/tabler/tabler-icons', sponsor: 'https://github.com/sponsors/codecalm' },
  { name: 'WC3MapTranslator', what: 'reads map files', url: 'https://github.com/ChiefOfGxBxL/WC3MapTranslator' },
  { name: 'mopaq', what: 'opens .w3x archives', url: 'https://github.com/jeany55/mopaq' },
  { name: 'wc3data', what: 'creep and item data', url: 'https://github.com/voces/wc3data' },
]

export function Footer() {
  return (
    <Container size="xl" py="xl" mt="xl" style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
      <Group gap={6} mb={6}>
        <IconHeart size={14} color="var(--mantine-color-red-5)" />
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Built with open source
        </Text>
      </Group>
      <Group gap="xs" style={{ rowGap: 4 }}>
        {CREDITS.map((c) => (
          <Text key={c.name} size="xs" c="dimmed">
            <Anchor href={c.url} target="_blank" rel="noreferrer" size="xs" c="gray.4" title={c.what}>
              {c.name}
            </Anchor>
            {c.sponsor && (
              <>
                {' ('}
                <Anchor href={c.sponsor} target="_blank" rel="noreferrer" size="xs" c="pink.4">
                  sponsor
                </Anchor>
                {')'}
              </>
            )}
          </Text>
        ))}
      </Group>
      <Text size="xs" c="dimmed" mt={6}>
        If W3Atlas helps you, consider supporting these projects. A GitHub star helps the small Warcraft III tools too. Warcraft III is a
        trademark of Blizzard Entertainment; W3Atlas is a fan project and isn't affiliated with Blizzard.
      </Text>
    </Container>
  )
}

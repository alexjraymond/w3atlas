import type { ReactNode } from 'react'
import { Anchor, AppShell, Button, Container, FileButton, Group, Menu, Text } from '@mantine/core'
import { IconChevronDown, IconDatabaseExport, IconDatabaseImport, IconMap2 } from '@tabler/icons-react'
import { POOL_MAPS } from '../data/maps'
import { href, navigate } from '../lib/router'
import { exportBundle, importData, useBuilds, useRoutes } from '../store'
import { downloadFile, readJsonFile } from '../lib/files'

export function Layout({ children }: { children: ReactNode }) {
  const routes = useRoutes()
  const allBuilds = useBuilds()
  return (
    <AppShell header={{ height: 52 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Anchor href={href.home()} underline="never" c="inherit">
              <Group gap={8} wrap="nowrap">
                <IconMap2 size={22} color="var(--mantine-color-yellow-5)" />
                <Text fw={800} size="lg" style={{ letterSpacing: 0.5 }}>
                  W3Atlas
                </Text>
              </Group>
            </Anchor>
            <Group gap={4} wrap="nowrap">
              <Button component="a" href={href.builds()} variant="subtle" color="gray" size="compact-sm">
                Builds
              </Button>
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <Button variant="subtle" color="gray" size="compact-sm" rightSection={<IconChevronDown size={14} />}>
                    Maps
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {POOL_MAPS.map((m) => (
                    <Menu.Item key={m.id} component="a" href={href.map(m.id)}>
                      {m.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <Button variant="subtle" color="gray" size="compact-sm" rightSection={<IconChevronDown size={14} />}>
                    Backup
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    {routes.length} routes · {allBuilds.length} builds (this browser)
                  </Menu.Label>
                  <Menu.Item
                    leftSection={<IconDatabaseExport size={16} />}
                    disabled={!routes.length && !allBuilds.length}
                    onClick={() => downloadFile(`w3atlas-backup-${new Date().toISOString().slice(0, 10)}.json`, exportBundle(routes, allBuilds))}
                  >
                    Export everything
                  </Menu.Item>
                  <FileButton
                    accept="application/json,.json"
                    onChange={async (file) => {
                      if (!file) return
                      try {
                        const res = importData(await readJsonFile(file))
                        alert(`Imported ${res.routes.length} route(s) and ${res.builds.length} build(s).`)
                        if (res.routes.length === 1) navigate(href.route(res.routes[0].id))
                      } catch {
                        alert('That file could not be read as W3Atlas routes.')
                      }
                    }}
                  >
                    {(props) => (
                      <Menu.Item leftSection={<IconDatabaseImport size={16} />} closeMenuOnClick={false} {...props}>
                        Import file…
                      </Menu.Item>
                    )}
                  </FileButton>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl" px={{ base: 0, sm: 'md' }}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

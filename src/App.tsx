import '@mantine/core/styles.css'
import './index.css'
import { MantineProvider } from '@mantine/core'
import { theme } from './theme'
import { useLocation } from './lib/router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { RoutePage } from './pages/RoutePage'
import { SharePage } from './pages/SharePage'
import { BuildsPage } from './pages/BuildsPage'
import { BuildPage } from './pages/BuildPage'
import { CommunityPage } from './pages/CommunityPage'
import { PublicRoutePage } from './pages/PublicRoutePage'

function Page() {
  const loc = useLocation()
  switch (loc.page) {
    case 'map':
      return <MapPage key={loc.mapId} mapId={loc.mapId} />
    case 'route':
      return <RoutePage key={loc.routeId} routeId={loc.routeId} />
    case 'share':
      return <SharePage code={loc.code} />
    case 'builds':
      return <BuildsPage />
    case 'build':
      return <BuildPage key={loc.buildId} buildId={loc.buildId} />
    case 'community':
      return <CommunityPage query={loc.query} />
    case 'publicRoute':
      return <PublicRoutePage key={loc.routeId} routeId={loc.routeId} />
    default:
      return <HomePage />
  }
}

export default function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Layout>
        <Page />
      </Layout>
    </MantineProvider>
  )
}

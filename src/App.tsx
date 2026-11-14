import '@mantine/core/styles.css'
import './index.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { useLocation } from './lib/router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { RoutePage } from './pages/RoutePage'
import { SharePage } from './pages/SharePage'

const theme = createTheme({
  primaryColor: 'yellow',
  primaryShade: { dark: 6 },
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
})

function Page() {
  const loc = useLocation()
  switch (loc.page) {
    case 'map':
      return <MapPage key={loc.mapId} mapId={loc.mapId} />
    case 'route':
      return <RoutePage key={loc.routeId} routeId={loc.routeId} />
    case 'share':
      return <SharePage code={loc.code} />
    default:
      return <HomePage />
  }
}

export default function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Layout>
        <Page />
      </Layout>
    </MantineProvider>
  )
}

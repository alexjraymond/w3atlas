import { useSyncExternalStore } from 'react'

// Tiny hash router: #/ · #/map/:mapId · #/route/:id · #/builds · #/build/:id · #/share/:code
// · #/community?map=..&race=.. · #/r/:id (a public route)
// Hash routing works on any static host (GitHub Pages, Netlify, file server) with no config.

export type RouteMatch =
  | { page: 'home' }
  | { page: 'map'; mapId: string }
  | { page: 'route'; routeId: string }
  | { page: 'share'; code: string }
  | { page: 'builds' }
  | { page: 'build'; buildId: string }
  | { page: 'community'; query: URLSearchParams }
  | { page: 'publicRoute'; routeId: string }

function parse(hash: string): RouteMatch {
  const [path, qs = ''] = hash.replace(/^#\/?/, '').split('?')
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] === 'community') return { page: 'community', query: new URLSearchParams(qs) }
  if (parts[0] === 'r' && parts[1]) return { page: 'publicRoute', routeId: parts[1] }
  if (parts[0] === 'map' && parts[1]) return { page: 'map', mapId: parts[1] }
  if (parts[0] === 'route' && parts[1]) return { page: 'route', routeId: parts[1] }
  if (parts[0] === 'share' && parts[1]) return { page: 'share', code: parts[1] }
  if (parts[0] === 'builds') return { page: 'builds' }
  if (parts[0] === 'build' && parts[1]) return { page: 'build', buildId: parts[1] }
  return { page: 'home' }
}

let current = parse(window.location.hash)
window.addEventListener('hashchange', () => {
  current = parse(window.location.hash)
  window.scrollTo(0, 0)
})

export function useLocation(): RouteMatch {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('hashchange', cb)
      return () => window.removeEventListener('hashchange', cb)
    },
    () => current,
  )
}

export const href = {
  home: () => '#/',
  map: (mapId: string) => `#/map/${encodeURIComponent(mapId)}`,
  route: (routeId: string) => `#/route/${encodeURIComponent(routeId)}`,
  share: (code: string) => `#/share/${code}`,
  builds: () => '#/builds',
  build: (buildId: string) => `#/build/${encodeURIComponent(buildId)}`,
  community: (query?: Record<string, string | undefined>) => {
    const qs = new URLSearchParams(Object.entries(query ?? {}).filter(([, v]) => v) as [string, string][]).toString()
    return `#/community${qs ? `?${qs}` : ''}`
  },
  publicRoute: (routeId: string) => `#/r/${encodeURIComponent(routeId)}`,
}

export function navigate(to: string) {
  window.location.hash = to.replace(/^#/, '')
}

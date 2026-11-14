import { useSyncExternalStore } from 'react'

// Tiny hash router: #/  ·  #/map/:mapId  ·  #/route/:routeId  ·  #/share/:code
// Hash routing works on any static host (GitHub Pages, Netlify, file server) with no config.

export type RouteMatch =
  | { page: 'home' }
  | { page: 'map'; mapId: string }
  | { page: 'route'; routeId: string }
  | { page: 'share'; code: string }

function parse(hash: string): RouteMatch {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] === 'map' && parts[1]) return { page: 'map', mapId: parts[1] }
  if (parts[0] === 'route' && parts[1]) return { page: 'route', routeId: parts[1] }
  if (parts[0] === 'share' && parts[1]) return { page: 'share', code: parts[1] }
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
}

export function navigate(to: string) {
  window.location.hash = to.replace(/^#/, '')
}

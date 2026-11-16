import type { CloudApi, CloudUser, Comment, Provider, RouteFilters, RouteSummary } from './types'
import { PAGE_SIZE } from './types'
import { buildToRow, routeToRow, rowToBuild, rowToRoute, type BuildRow, type RouteRow } from './rows'

// A local stand-in for the Supabase backend, for development and tests (VITE_CLOUD_MOCK=1).
// Everything lives in localStorage; each sign-in provider acts as a different user, so ratings and
// comments between users can be tried in one browser. Mirrors the database's security rules.

const KEY = 'w3atlas.mockcloud.v1'
const SESSION = 'w3atlas.mockcloud.user'

interface Db {
  routes: (RouteRow & { owner_id: string })[]
  builds: (BuildRow & { owner_id: string })[]
  ratings: { route_id: string; user_id: string; stars: number }[]
  comments: { id: string; route_id: string; user_id: string; body: string; created_at: string }[]
}

const USERS: Record<Provider, CloudUser> = {
  discord: { id: '11111111-1111-4111-8111-111111111111', username: 'DiscordTester', avatarUrl: null },
  twitch: { id: '22222222-2222-4222-8222-222222222222', username: 'TwitchTester', avatarUrl: null },
  google: { id: '33333333-3333-4333-8333-333333333333', username: 'GoogleTester', avatarUrl: null },
}
const userById = (id: string) => Object.values(USERS).find((u) => u.id === id)

function load(): Db {
  try {
    return { routes: [], builds: [], ratings: [], comments: [], ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { routes: [], builds: [], ratings: [], comments: [] }
  }
}
const save = (db: Db) => localStorage.setItem(KEY, JSON.stringify(db))
const now = () => new Date().toISOString()
const delay = () => new Promise((r) => setTimeout(r, 60))

export function createMockApi(): CloudApi {
  const listeners = new Set<(u: CloudUser | null) => void>()
  const current = (): CloudUser | null => {
    const id = sessionStorage.getItem(SESSION)
    return id ? (userById(id) ?? null) : null
  }
  const me = () => {
    const u = current()
    if (!u) throw new Error('Not signed in')
    return u.id
  }
  const author = (id: string) => {
    const u = userById(id)
    return { id, username: u?.username ?? 'unknown', avatarUrl: u?.avatarUrl ?? null }
  }
  const aggregate = (db: Db, routeId: string) => {
    const r = db.routes.find((x) => x.id === routeId)
    if (!r) return
    const stars = db.ratings.filter((x) => x.route_id === routeId).map((x) => x.stars)
    r.rating_count = stars.length
    r.rating_avg = stars.length ? Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 100) / 100 : 0
    r.comment_count = db.comments.filter((x) => x.route_id === routeId).length
  }
  const summary = (r: RouteRow): RouteSummary => ({
    id: r.id,
    title: r.title,
    mapId: r.map_id,
    race: (r.race as RouteSummary['race']) ?? null,
    vs: (r.vs as RouteSummary['vs']) ?? 'any',
    hero: r.hero,
    isPublic: r.is_public,
    ratingAvg: Number(r.rating_avg),
    ratingCount: r.rating_count,
    commentCount: r.comment_count,
    updatedAt: Date.parse(r.updated_at),
    author: author(r.owner_id),
  })
  const visible = (r: RouteRow) => r.is_public || r.owner_id === current()?.id

  return {
    kind: 'mock',
    async getUser() {
      return current()
    },
    onAuthChange(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    async signIn(provider) {
      sessionStorage.setItem(SESSION, USERS[provider].id)
      listeners.forEach((l) => l(USERS[provider]))
    },
    async signOut() {
      sessionStorage.removeItem(SESSION)
      listeners.forEach((l) => l(null))
    },

    async fetchMine() {
      await delay()
      const id = me()
      const db = load()
      return {
        routes: db.routes.filter((r) => r.owner_id === id).map(rowToRoute).filter((x) => !!x),
        builds: db.builds.filter((b) => b.owner_id === id).map(rowToBuild).filter((x) => !!x),
      }
    },
    async saveRoute(route, buildInCloud) {
      await delay()
      const id = me()
      if (route.ownerId !== id) throw new Error('not your route')
      const db = load()
      const existing = db.routes.find((r) => r.id === route.id)
      if (existing && existing.owner_id !== id) throw new Error('not your route')
      const row = { ...routeToRow(route, buildInCloud), owner_id: id }
      if (existing) Object.assign(existing, row, { updated_at: now() })
      else db.routes.push({ ...row, rating_avg: 0, rating_count: 0, comment_count: 0, created_at: now(), updated_at: now() })
      save(db)
    },
    async deleteRoute(routeId) {
      const id = me()
      const db = load()
      db.routes = db.routes.filter((r) => !(r.id === routeId && r.owner_id === id))
      db.ratings = db.ratings.filter((r) => db.routes.some((x) => x.id === r.route_id))
      db.comments = db.comments.filter((c) => db.routes.some((x) => x.id === c.route_id))
      save(db)
    },
    async saveBuild(build) {
      await delay()
      const id = me()
      const db = load()
      const existing = db.builds.find((b) => b.id === build.id)
      if (existing && existing.owner_id !== id) throw new Error('not your build')
      const row = { ...buildToRow(build), owner_id: id, updated_at: now() }
      if (existing) Object.assign(existing, row)
      else db.builds.push(row)
      save(db)
    },
    async deleteBuild(buildId) {
      const id = me()
      const db = load()
      db.builds = db.builds.filter((b) => !(b.id === buildId && b.owner_id === id))
      db.routes.forEach((r) => r.build_id === buildId && (r.build_id = null))
      save(db)
    },

    async listRoutes(f: RouteFilters) {
      await delay()
      const search = f.search?.trim().toLowerCase()
      let rows = load().routes.filter(
        (r) =>
          r.is_public &&
          (!f.mapId || r.map_id === f.mapId) &&
          (!f.race || r.race === f.race) &&
          (!f.vs || f.vs === 'any' || r.vs === f.vs || r.vs === 'any') &&
          (!f.hero || r.hero === f.hero) &&
          (!search || r.title.toLowerCase().includes(search)),
      )
      rows = rows.sort((a, b) =>
        f.sort === 'top'
          ? Number(b.rating_avg) - Number(a.rating_avg) || b.rating_count - a.rating_count || b.updated_at.localeCompare(a.updated_at)
          : b.updated_at.localeCompare(a.updated_at),
      )
      return { items: rows.slice(f.page * PAGE_SIZE, (f.page + 1) * PAGE_SIZE).map(summary), total: rows.length }
    },
    async getRoute(routeId) {
      await delay()
      const db = load()
      const row = db.routes.find((r) => r.id === routeId)
      if (!row || !visible(row)) return null
      const route = rowToRoute(row)
      if (!route) return null
      const b = row.build_id ? db.builds.find((x) => x.id === row.build_id) : undefined
      return { route, build: b ? rowToBuild(b) : null, summary: summary(row) }
    },
    async myRating(routeId) {
      const u = current()
      return u ? (load().ratings.find((r) => r.route_id === routeId && r.user_id === u.id)?.stars ?? null) : null
    },
    async rate(routeId, stars) {
      await delay()
      const id = me()
      const db = load()
      const route = db.routes.find((r) => r.id === routeId)
      if (!route || !route.is_public || route.owner_id === id) throw new Error("You can't rate this route")
      db.ratings = db.ratings.filter((r) => !(r.route_id === routeId && r.user_id === id))
      if (stars != null) db.ratings.push({ route_id: routeId, user_id: id, stars: Math.min(5, Math.max(1, stars)) })
      aggregate(db, routeId)
      save(db)
    },
    async listComments(routeId) {
      await delay()
      return load()
        .comments.filter((c) => c.route_id === routeId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((c): Comment => ({ id: c.id, routeId: c.route_id, body: c.body, createdAt: Date.parse(c.created_at), author: author(c.user_id) }))
    },
    async addComment(routeId, body) {
      await delay()
      const id = me()
      const db = load()
      const route = db.routes.find((r) => r.id === routeId)
      if (!route || !visible(route)) throw new Error("You can't comment on this route")
      if (!body.trim() || body.length > 2000) throw new Error('Comments are 1-2000 characters')
      db.comments.push({ id: crypto.randomUUID(), route_id: routeId, user_id: id, body, created_at: now() })
      aggregate(db, routeId)
      save(db)
    },
    async deleteComment(commentId) {
      const id = me()
      const db = load()
      const c = db.comments.find((x) => x.id === commentId)
      const route = c && db.routes.find((r) => r.id === c.route_id)
      if (!c || (c.user_id !== id && route?.owner_id !== id)) throw new Error("You can't delete this comment")
      db.comments = db.comments.filter((x) => x.id !== commentId)
      aggregate(db, c.route_id)
      save(db)
    },
  }
}

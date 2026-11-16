import type { Build, Route } from '../types'
import { sanitizeBuild, sanitizeRoute } from '../store/sanitize'
import type { Author, RouteSummary } from './types'

// Mapping between app objects and database rows. The full object lives in `data`; a few fields are
// copied into columns so they can be filtered, sorted and protected by row-level security.

export interface ProfileRow {
  id: string
  username: string
  avatar_url: string | null
}

export interface RouteRow {
  id: string
  owner_id: string
  title: string
  map_id: string
  race: string | null
  vs: string
  hero: string | null
  build_id: string | null
  data: unknown
  is_public: boolean
  rating_avg: number | string
  rating_count: number
  comment_count: number
  created_at: string
  updated_at: string
  owner?: ProfileRow | null
}

export interface BuildRow {
  id: string
  owner_id: string
  title: string
  race: string | null
  vs: string
  data: unknown
  is_public: boolean
  updated_at: string
}

export const routeToRow = (r: Route, buildInCloud: boolean) => ({
  id: r.id,
  owner_id: r.ownerId,
  title: r.name.slice(0, 120),
  map_id: r.mapId,
  race: r.race,
  vs: r.vs,
  hero: r.hero,
  build_id: buildInCloud ? r.buildId : null,
  data: r,
  is_public: r.isPublic,
})

export const buildToRow = (b: Build) => ({
  id: b.id,
  owner_id: b.ownerId,
  title: b.name.slice(0, 120),
  race: b.race,
  vs: b.vs,
  data: b,
  is_public: b.isPublic,
})

export function rowToRoute(row: RouteRow): Route | null {
  const res = sanitizeRoute(row.data)
  if (!res) return null
  return { ...res.route, id: row.id, ownerId: row.owner_id, isPublic: row.is_public }
}

export function rowToBuild(row: BuildRow): Build | null {
  const b = sanitizeBuild(row.data)
  if (!b) return null
  return { ...b, id: row.id, ownerId: row.owner_id, isPublic: row.is_public }
}

export const rowToAuthor = (p: ProfileRow | null | undefined, id: string): Author => ({
  id,
  username: p?.username ?? 'unknown',
  avatarUrl: p?.avatar_url ?? null,
})

export const rowToSummary = (row: RouteRow): RouteSummary => ({
  id: row.id,
  title: row.title,
  mapId: row.map_id,
  race: (row.race as RouteSummary['race']) ?? null,
  vs: (row.vs as RouteSummary['vs']) ?? 'any',
  hero: row.hero,
  isPublic: row.is_public,
  ratingAvg: Number(row.rating_avg) || 0,
  ratingCount: row.rating_count,
  commentCount: row.comment_count,
  updatedAt: Date.parse(row.updated_at),
  author: rowToAuthor(row.owner, row.owner_id),
})

import type { Build, Matchup, Race, Route } from '../types'

export type Provider = 'discord' | 'twitch' | 'google'

export interface CloudUser {
  id: string
  username: string
  avatarUrl: string | null
}

export interface Author {
  id: string
  username: string
  avatarUrl: string | null
}

/** A public route as listed in Community. */
export interface RouteSummary {
  id: string
  title: string
  mapId: string
  race: Race | null
  vs: Matchup
  hero: string | null
  isPublic: boolean
  ratingAvg: number
  ratingCount: number
  commentCount: number
  updatedAt: number
  author: Author
}

export interface RouteDetail {
  route: Route
  build: Build | null
  summary: RouteSummary
}

export interface Comment {
  id: string
  routeId: string
  body: string
  createdAt: number
  author: Author
}

export interface RouteFilters {
  mapId?: string
  race?: Race
  vs?: Matchup
  hero?: string
  search?: string
  sort: 'top' | 'new'
  page: number // 0-based
}

export const PAGE_SIZE = 24

/** Everything the app does with the backend. Implemented by Supabase (and a local mock for development). */
export interface CloudApi {
  kind: 'supabase' | 'mock'
  getUser(): Promise<CloudUser | null>
  onAuthChange(cb: (user: CloudUser | null) => void): () => void
  signIn(provider: Provider): Promise<void>
  signOut(): Promise<void>

  fetchMine(): Promise<{ routes: Route[]; builds: Build[] }>
  saveRoute(route: Route, buildInCloud: boolean): Promise<void>
  deleteRoute(id: string): Promise<void>
  saveBuild(build: Build): Promise<void>
  deleteBuild(id: string): Promise<void>

  listRoutes(filters: RouteFilters): Promise<{ items: RouteSummary[]; total: number }>
  getRoute(id: string): Promise<RouteDetail | null>
  myRating(routeId: string): Promise<number | null>
  rate(routeId: string, stars: number | null): Promise<void>
  listComments(routeId: string): Promise<Comment[]>
  addComment(routeId: string, body: string): Promise<void>
  deleteComment(id: string): Promise<void>
}

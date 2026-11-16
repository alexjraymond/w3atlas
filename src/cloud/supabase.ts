import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { CloudApi, CloudUser, Comment, RouteFilters } from './types'
import { PAGE_SIZE } from './types'
import { buildToRow, routeToRow, rowToAuthor, rowToBuild, rowToRoute, rowToSummary, type BuildRow, type ProfileRow, type RouteRow } from './rows'

const SUMMARY_COLUMNS =
  'id, owner_id, title, map_id, race, vs, hero, build_id, is_public, rating_avg, rating_count, comment_count, created_at, updated_at, owner:profiles(id, username, avatar_url)'

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

export function createSupabaseApi(url: string, anonKey: string): CloudApi {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  })

  const profiles = new Map<string, CloudUser>()
  async function toUser(u: User | null | undefined): Promise<CloudUser | null> {
    if (!u) return null
    const cached = profiles.get(u.id)
    if (cached) return cached
    const { data } = await sb.from('profiles').select('id, username, avatar_url').eq('id', u.id).maybeSingle<ProfileRow>()
    const meta = u.user_metadata ?? {}
    const user: CloudUser = {
      id: u.id,
      username: data?.username ?? meta.preferred_username ?? meta.full_name ?? meta.name ?? 'player',
      avatarUrl: data?.avatar_url ?? meta.avatar_url ?? null,
    }
    profiles.set(u.id, user)
    return user
  }

  async function uid(): Promise<string> {
    const { data } = await sb.auth.getSession()
    const id = data.session?.user.id
    if (!id) throw new Error('Not signed in')
    return id
  }

  return {
    kind: 'supabase',

    async getUser() {
      const { data } = await sb.auth.getSession()
      return toUser(data.session?.user)
    },

    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') return
        // defer: supabase-js warns against awaiting other calls inside this callback
        setTimeout(() => void toUser(session?.user).then(cb), 0)
      })
      return () => data.subscription.unsubscribe()
    },

    async signIn(provider) {
      // come back to the same page after the provider's login screen
      const redirectTo = window.location.origin + window.location.pathname + window.location.hash
      const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } })
      fail(error)
    },

    async signOut() {
      const { error } = await sb.auth.signOut()
      fail(error)
    },

    async fetchMine() {
      const me = await uid()
      const [r, b] = await Promise.all([
        sb.from('routes').select('*').eq('owner_id', me),
        sb.from('builds').select('*').eq('owner_id', me),
      ])
      fail(r.error)
      fail(b.error)
      return {
        routes: ((r.data ?? []) as RouteRow[]).map(rowToRoute).filter((x) => !!x),
        builds: ((b.data ?? []) as BuildRow[]).map(rowToBuild).filter((x) => !!x),
      }
    },

    async saveRoute(route, buildInCloud) {
      const { error } = await sb.from('routes').upsert(routeToRow(route, buildInCloud))
      fail(error)
    },

    async deleteRoute(id) {
      const { error } = await sb.from('routes').delete().eq('id', id)
      fail(error)
    },

    async saveBuild(build) {
      const { error } = await sb.from('builds').upsert(buildToRow(build))
      fail(error)
    },

    async deleteBuild(id) {
      const { error } = await sb.from('builds').delete().eq('id', id)
      fail(error)
    },

    async listRoutes(f: RouteFilters) {
      let q = sb.from('routes').select(SUMMARY_COLUMNS, { count: 'exact' }).eq('is_public', true)
      if (f.mapId) q = q.eq('map_id', f.mapId)
      if (f.race) q = q.eq('race', f.race)
      if (f.vs && f.vs !== 'any') q = q.in('vs', [f.vs, 'any'])
      if (f.hero) q = q.eq('hero', f.hero)
      if (f.search?.trim()) q = q.ilike('title', `%${f.search.trim().replace(/[%_]/g, '\\$&')}%`)
      q =
        f.sort === 'top'
          ? q.order('rating_avg', { ascending: false }).order('rating_count', { ascending: false }).order('updated_at', { ascending: false })
          : q.order('updated_at', { ascending: false })
      const { data, error, count } = await q.range(f.page * PAGE_SIZE, f.page * PAGE_SIZE + PAGE_SIZE - 1)
      fail(error)
      return { items: ((data ?? []) as unknown as RouteRow[]).map(rowToSummary), total: count ?? 0 }
    },

    async getRoute(id) {
      const { data, error } = await sb.from('routes').select(`*, owner:profiles(id, username, avatar_url)`).eq('id', id).maybeSingle()
      fail(error)
      if (!data) return null
      const row = data as RouteRow
      const route = rowToRoute(row)
      if (!route) return null
      let build = null
      if (row.build_id) {
        const b = await sb.from('builds').select('*').eq('id', row.build_id).maybeSingle()
        if (b.data) build = rowToBuild(b.data as BuildRow)
      }
      return { route, build, summary: rowToSummary(row) }
    },

    async myRating(routeId) {
      const me = (await sb.auth.getSession()).data.session?.user.id
      if (!me) return null
      const { data } = await sb.from('route_ratings').select('stars').eq('route_id', routeId).eq('user_id', me).maybeSingle()
      return (data?.stars as number | undefined) ?? null
    },

    async rate(routeId, stars) {
      const me = await uid()
      if (stars == null) {
        const { error } = await sb.from('route_ratings').delete().eq('route_id', routeId).eq('user_id', me)
        fail(error)
      } else {
        const { error } = await sb.from('route_ratings').upsert({ route_id: routeId, user_id: me, stars })
        fail(error)
      }
    },

    async listComments(routeId) {
      const { data, error } = await sb
        .from('route_comments')
        .select('id, route_id, body, created_at, user_id, author:profiles(id, username, avatar_url)')
        .eq('route_id', routeId)
        .order('created_at', { ascending: true })
      fail(error)
      return ((data ?? []) as unknown as { id: string; route_id: string; body: string; created_at: string; user_id: string; author: ProfileRow | null }[]).map(
        (c): Comment => ({ id: c.id, routeId: c.route_id, body: c.body, createdAt: Date.parse(c.created_at), author: rowToAuthor(c.author, c.user_id) }),
      )
    },

    async addComment(routeId, body) {
      const { error } = await sb.from('route_comments').insert({ route_id: routeId, body })
      fail(error)
    },

    async deleteComment(id) {
      const { error } = await sb.from('route_comments').delete().eq('id', id)
      fail(error)
    },
  }
}

import { useSyncExternalStore } from 'react'
import type { Build, Route } from '../types'
import { builds, routes, setCurrentUser } from '../store'
import { isUuid, newId } from '../game/route'
import { cloud, type CloudUser, type Provider } from './index'

// Keeps the signed-in user's routes and builds in their account.
//  * sign in: pull the account's items into this browser (newer copy wins)
//  * any local edit to an item you own: pushed shortly after (builds first, so routes can link them)
//  * delete: removed from the account too
//  * sign out: your account's items are removed from this browser (local-only items stay)
// Items made while signed out stay local until you choose "Add to my account" (claimLocal).

export type SyncStatus = 'offline' | 'signed-out' | 'syncing' | 'synced' | 'error'

interface State {
  user: CloudUser | null
  status: SyncStatus
  error: string | null
  ready: boolean // the first auth check has finished
}

let state: State = { user: null, status: cloud ? 'signed-out' : 'offline', error: null, ready: !cloud }
const listeners = new Set<() => void>()
function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
export const useAccount = () => useSyncExternalStore(subscribe, () => state)
export const getAccount = () => state

// what the account last had: id -> updatedAt
const syncedRoutes = new Map<string, number>()
const syncedBuilds = new Map<string, number>()
let timer: ReturnType<typeof setTimeout> | null = null
let flushing: Promise<void> | null = null
let started = false

function schedule() {
  if (!state.user) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void flush(), 700)
}

async function flush(): Promise<void> {
  if (flushing) {
    await flushing
    return schedule()
  }
  const user = state.user
  if (!cloud || !user) return
  flushing = (async () => {
    try {
      const mineB = builds.all().filter((b) => b.ownerId === user.id)
      const mineR = routes.all().filter((r) => r.ownerId === user.id)
      const changedB = mineB.filter((b) => syncedBuilds.get(b.id) !== b.updatedAt)
      const changedR = mineR.filter((r) => syncedRoutes.get(r.id) !== r.updatedAt)
      const goneR = [...syncedRoutes.keys()].filter((id) => !mineR.some((r) => r.id === id))
      const goneB = [...syncedBuilds.keys()].filter((id) => !mineB.some((b) => b.id === id))
      if (!changedB.length && !changedR.length && !goneR.length && !goneB.length) return
      setState({ status: 'syncing' })
      for (const b of changedB) {
        await cloud.saveBuild(b)
        syncedBuilds.set(b.id, b.updatedAt)
      }
      for (const r of changedR) {
        const linked = !!r.buildId && builds.get(r.buildId)?.ownerId === user.id
        await cloud.saveRoute(r, linked)
        syncedRoutes.set(r.id, r.updatedAt)
      }
      for (const id of goneR) {
        await cloud.deleteRoute(id)
        syncedRoutes.delete(id)
      }
      for (const id of goneB) {
        await cloud.deleteBuild(id)
        syncedBuilds.delete(id)
      }
      setState({ status: 'synced', error: null })
    } catch (e) {
      setState({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  })()
  try {
    await flushing
  } finally {
    flushing = null
  }
}

function merge<T extends Route | Build>(local: T[], remote: T[], synced: Map<string, number>): T[] {
  const take: T[] = []
  for (const r of remote) {
    const l = local.find((x) => x.id === r.id)
    if (!l || r.updatedAt >= l.updatedAt) {
      take.push(r)
      synced.set(r.id, r.updatedAt)
    } else {
      synced.set(r.id, r.updatedAt) // local is newer: flush() will push it
    }
  }
  return take
}

async function onSignedIn(user: CloudUser) {
  setCurrentUser(user.id)
  setState({ user, status: 'syncing', error: null, ready: true })
  try {
    const remote = await cloud!.fetchMine()
    syncedRoutes.clear()
    syncedBuilds.clear()
    builds.putMany(merge(builds.all(), remote.builds, syncedBuilds))
    routes.putMany(merge(routes.all(), remote.routes, syncedRoutes))
    setState({ status: 'synced' })
    schedule() // push anything newer locally / not yet in the account
  } catch (e) {
    setState({ status: 'error', error: e instanceof Error ? e.message : String(e) })
  }
}

function onSignedOut() {
  const prev = state.user
  if (prev) {
    // your account's copies leave this browser (e.g. a shared tournament PC)
    routes.removeWhere((r) => r.ownerId === prev.id)
    builds.removeWhere((b) => b.ownerId === prev.id)
  }
  syncedRoutes.clear()
  syncedBuilds.clear()
  setCurrentUser(null)
  setState({ user: null, status: 'signed-out', error: null, ready: true })
}

/** Start watching auth and local changes. Call once at app start. */
export function startSync() {
  if (!cloud || started) return
  started = true
  routes.subscribe(schedule)
  builds.subscribe(schedule)
  cloud.onAuthChange((user) => {
    if (user && user.id !== state.user?.id) void onSignedIn(user)
    else if (!user && state.user) onSignedOut()
  })
  void cloud.getUser().then((user) => (user ? onSignedIn(user) : setState({ ready: true })))
  window.addEventListener('beforeunload', () => {
    if (timer) void flush()
  })
}

export const signIn = (p: Provider) => cloud?.signIn(p)
export const signOut = async () => {
  await flush()
  await cloud?.signOut()
}
export const retrySync = () => schedule()

/** Items saved only in this browser (made while signed out). */
export function useLocalOnlyCount() {
  const r = routes.useAll()
  const b = builds.useAll()
  return r.filter((x) => !x.ownerId).length + b.filter((x) => !x.ownerId).length
}

/** Move local-only routes and builds into the signed-in account. */
export function claimLocal() {
  const user = state.user
  if (!user) return
  // older items have short ids; the database needs UUIDs
  const idMap = new Map<string, string>()
  const now = Date.now()
  const localBuilds = builds.all().filter((b) => !b.ownerId)
  const localRoutes = routes.all().filter((r) => !r.ownerId)
  const newBuilds = localBuilds.map((b) => {
    const id = isUuid(b.id) ? b.id : newId()
    idMap.set(b.id, id)
    return { ...b, id, ownerId: user.id, updatedAt: now }
  })
  const newRoutes = localRoutes.map((r) => ({
    ...r,
    id: isUuid(r.id) ? r.id : newId(),
    ownerId: user.id,
    buildId: r.buildId ? (idMap.get(r.buildId) ?? r.buildId) : null,
    updatedAt: now,
  }))
  builds.removeWhere((b) => !b.ownerId)
  routes.removeWhere((r) => !r.ownerId)
  builds.putMany(newBuilds)
  routes.putMany(newRoutes)
  // routes elsewhere that linked a re-id'd build
  routes.putMany(routes.all().filter((r) => r.buildId && idMap.has(r.buildId)).map((r) => ({ ...r, buildId: idMap.get(r.buildId!)!, updatedAt: now })))
  schedule()
  return { routes: newRoutes.length, builds: newBuilds.length }
}

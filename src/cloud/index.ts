import type { CloudApi } from './types'
import { createSupabaseApi } from './supabase'
import { createMockApi } from './mock'

// The backend, if one is configured:
//   VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY  -> Supabase (accounts, sync, community)
//   VITE_CLOUD_MOCK=1                           -> local mock backend for development
//   neither                                     -> null: the app works fully offline, accounts hidden
const env = import.meta.env

export const cloud: CloudApi | null =
  env.VITE_CLOUD_MOCK === '1'
    ? createMockApi()
    : env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
      ? createSupabaseApi(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
      : null

export * from './types'

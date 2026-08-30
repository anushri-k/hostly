import { branches, settings } from '@/server/seed'
import { initials } from '@/lib/utils'
import { DEMO_ACCOUNTS } from './permissions'
import type { Role, SessionBranch, SessionRestaurant, SessionUser } from '@/types'

export interface AuthBundle {
  user: SessionUser
  restaurant: SessionRestaurant
  branches: SessionBranch[]
}

/**
 * Client-side demo auth used by the static build.
 *
 * SUPABASE SWAP POINT — replace the two functions below with Supabase auth
 * calls (`supabase.auth.signInWithPassword`, then load the profile/restaurant
 * rows). Nothing outside this file needs to change: `use-auth` only depends on
 * the `AuthBundle` shape.
 */

const restaurant: SessionRestaurant = {
  id: 'riverside',
  name: settings.name,
  tagline: 'Scan. Order. Enjoy.',
  email: settings.contactEmail,
  phone: settings.contactPhone,
}

const sessionBranches: SessionBranch[] = branches.map((b) => ({
  id: b.id,
  name: b.name,
  meta: b.meta,
}))

function bundleFor(acct: (typeof DEMO_ACCOUNTS)[number], role?: Role): AuthBundle {
  return {
    user: {
      id: acct.email,
      name: acct.name,
      email: acct.email,
      role: role ?? acct.role,
      initials: initials(acct.name),
    },
    restaurant,
    branches: sessionBranches,
  }
}

/** Verify demo credentials. `role` is an optional override from the selector. */
export async function signIn(email: string, password: string, role?: Role): Promise<AuthBundle> {
  const acct = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase())
  if (!acct || acct.password !== password) throw new Error('Invalid email or password')
  return bundleFor(acct, role)
}

/** Look up a demo account by role (used by the in-app role switcher). */
export async function signInAs(role: Role): Promise<AuthBundle> {
  const acct = DEMO_ACCOUNTS.find((a) => a.role === role)
  if (!acct) throw new Error('No demo account for that role')
  return bundleFor(acct, role)
}

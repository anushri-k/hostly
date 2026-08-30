'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, SessionBranch, SessionRestaurant, SessionUser } from '@/types'

interface AuthBundle {
  user: SessionUser
  restaurant: SessionRestaurant
  branches: SessionBranch[]
}

interface AuthState {
  user: SessionUser | null
  restaurant: SessionRestaurant | null
  branches: SessionBranch[]
  hydrated: boolean
  login: (email: string, password: string, role?: Role) => Promise<SessionUser>
  loginAs: (role: Role) => Promise<SessionUser>
  logout: () => void
  setHydrated: () => void
}

async function postLogin(payload: Record<string, unknown>): Promise<AuthBundle> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Could not sign in')
  return data as AuthBundle
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      restaurant: null,
      branches: [],
      hydrated: false,
      async login(email, password, role) {
        const bundle = await postLogin({ email, password, role })
        set({ user: bundle.user, restaurant: bundle.restaurant, branches: bundle.branches })
        return bundle.user
      },
      async loginAs(role) {
        const bundle = await postLogin({ role, switch: true })
        set({ user: bundle.user, restaurant: bundle.restaurant, branches: bundle.branches })
        return bundle.user
      },
      logout() {
        set({ user: null, restaurant: null, branches: [] })
      },
      setHydrated() {
        set({ hydrated: true })
      },
    }),
    {
      name: 'hostly-auth',
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
)

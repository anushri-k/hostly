'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signIn, signInAs } from './demo-auth'
import type { Role, SessionBranch, SessionRestaurant, SessionUser } from '@/types'

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

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      restaurant: null,
      branches: [],
      hydrated: false,
      async login(email, password, role) {
        const bundle = await signIn(email, password, role)
        set({ user: bundle.user, restaurant: bundle.restaurant, branches: bundle.branches })
        return bundle.user
      },
      async loginAs(role) {
        const bundle = await signInAs(role)
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

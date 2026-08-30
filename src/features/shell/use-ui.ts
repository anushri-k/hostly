'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UIState {
  sidebarCollapsed: boolean
  branch: string
  theme: Theme
  toggleSidebar: () => void
  setBranch: (branch: string) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      branch: 'Riverside',
      theme: 'light',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setBranch: (branch) => set({ branch }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'hostly-ui' },
  ),
)

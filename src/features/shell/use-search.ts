'use client'

import { create } from 'zustand'

interface SearchState {
  query: string
  setQuery: (query: string) => void
}

/** Transient global search (not persisted). Modules read this to filter. */
export const useSearch = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}))

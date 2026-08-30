import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Simulate network latency for the mock data layer. */
export function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Initials from a full name, e.g. "Maya Aronsson" -> "MA". */
export function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

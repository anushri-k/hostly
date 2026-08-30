import 'server-only'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { initials } from '@/lib/utils'
import type { Role, SessionBranch, SessionRestaurant, SessionUser } from '@/types'

type UserWithRestaurant = Prisma.UserGetPayload<{
  include: { restaurant: { include: { branches: true } } }
}>

export interface AuthBundle {
  user: SessionUser
  restaurant: SessionRestaurant
  branches: SessionBranch[]
}

/**
 * Verify credentials against the database and return the user together with
 * their restaurant and branches. `role` is an optional override used by the
 * demo role switcher — it only takes effect for users in the same restaurant.
 */
export async function authenticate(
  email: string,
  password: string,
  role?: Role,
): Promise<AuthBundle | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { restaurant: { include: { branches: true } } },
  })
  if (!user) return null

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return null

  return toBundle(user, role)
}

/** Look up a demo account by role within the seeded restaurant (role switcher). */
export async function authenticateAs(role: Role): Promise<AuthBundle | null> {
  const user = await prisma.user.findFirst({
    where: { role },
    include: { restaurant: { include: { branches: true } } },
  })
  if (!user) return null
  return toBundle(user, role)
}

function toBundle(user: UserWithRestaurant, role?: Role): AuthBundle {
  const r = user.restaurant
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (role ?? user.role) as Role,
      initials: initials(user.name),
    },
    restaurant: {
      id: r.id,
      name: r.name,
      tagline: r.tagline ?? '',
      email: r.email,
      phone: r.phone ?? '',
    },
    branches: r.branches
      .sort((a, b) => Number(b.isMain) - Number(a.isMain))
      .map((b) => ({ id: b.id, name: b.name, meta: b.meta })),
  }
}

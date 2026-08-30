import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticate, authenticateAs } from '@/server/db/auth'
import type { Role } from '@/types'

const schema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(['Owner', 'Manager', 'Cashier', 'Kitchen Supervisor']).optional(),
  // When true, look up the demo account for `role` (used by the role switcher).
  switch: z.boolean().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { email, password, role, switch: isSwitch } = parsed.data

  try {
    const bundle =
      isSwitch && role
        ? await authenticateAs(role as Role)
        : email && password
          ? await authenticate(email, password, role as Role | undefined)
          : null

    if (!bundle) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    return NextResponse.json(bundle)
  } catch (e) {
    console.error('Login failed', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

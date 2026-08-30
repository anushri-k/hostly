'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthShell } from '@/features/auth/auth-shell'
import { useAuth } from '@/features/auth/use-auth'
import { DEMO_ACCOUNTS } from '@/features/auth/permissions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

const ROLES: Role[] = ['Owner', 'Manager', 'Cashier', 'Kitchen Supervisor']

export default function LoginPage() {
  const router = useRouter()
  const login = useAuth((s) => s.login)
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s.hydrated)
  const [role, setRole] = useState<Role>('Owner')
  const [remember, setRemember] = useState(true)
  const [showPwd, setShowPwd] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'maya@riverside.co', password: 'plato2026' },
  })

  // Already signed in → go straight to the dashboard.
  useEffect(() => {
    if (hydrated && user) router.replace('/dashboard')
  }, [hydrated, user, router])

  function pickRole(r: Role) {
    setRole(r)
    const acct = DEMO_ACCOUNTS.find((a) => a.role === r)
    if (acct) {
      setValue('email', acct.email)
      setValue('password', acct.password)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const u = await login(values.email, values.password, role)
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`)
      router.replace('/dashboard')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not sign in')
    }
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-ink">Sign in</h2>
        <p className="mt-1 text-[14px] text-ink-muted">Welcome back — let&apos;s get you to your floor.</p>
      </div>

      {/* Role selector */}
      <div className="mb-5">
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">Sign in as</div>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => pickRole(r)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors',
                role === r
                  ? 'border-graphite bg-graphite text-white'
                  : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Email</label>
          <Input type="email" placeholder="you@restaurant.co" {...register('email')} />
          {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Password</label>
            <Link href="/forgot-password" className="text-[12px] font-semibold text-emerald hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...register('password')} />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[12px] text-danger">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <Switch checked={remember} onCheckedChange={setRemember} id="remember" />
            <label htmlFor="remember" className="text-[13px] font-medium text-ink-muted">
              Keep me signed in
            </label>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 rounded-xl bg-line-soft px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">Demo:</span> any role button fills working credentials.
        Password for all accounts is <code className="rounded bg-card px-1">plato2026</code>.
      </p>
    </AuthShell>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { AuthShell } from '@/features/auth/auth-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-tint">
            <MailCheck className="h-7 w-7 text-emerald" />
          </div>
          <h2 className="text-[22px] font-bold text-ink">Check your inbox</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            If an account exists for <span className="font-semibold text-ink">{getValues('email')}</span>, a
            reset link is on its way.
          </p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/reset-password">Continue to reset</Link>
          </Button>
          <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-ink">Reset your password</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Email</label>
          <Input type="email" placeholder="you@restaurant.co" {...register('email')} />
          {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </AuthShell>
  )
}

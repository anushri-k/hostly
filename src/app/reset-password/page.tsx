'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AuthShell } from '@/features/auth/auth-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Password updated — please sign in')
    router.replace('/login')
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-ink">Choose a new password</h2>
        <p className="mt-1 text-[14px] text-ink-muted">Make it strong and memorable.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">New password</label>
          <Input type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="mt-1 text-[12px] text-danger">{errors.password.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Confirm password</label>
          <Input type="password" placeholder="••••••••" {...register('confirm')} />
          {errors.confirm && <p className="mt-1 text-[12px] text-danger">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </AuthShell>
  )
}

import { Check } from 'lucide-react'

const HIGHLIGHTS = [
  'One queue for dine-in, takeaway, Zomato & Swiggy',
  'Menu, ingredients and low-stock alerts in sync',
  'Live analytics, roles and secure sessions',
]

/** Split-screen branded shell shared by login / forgot / reset. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-graphite p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="font-display flex h-10 w-10 items-center justify-center rounded-xl bg-emerald text-2xl">
            H
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">Hostly</div>
            <div className="text-[10.5px] tracking-wide text-white/45">RESTAURANT OS</div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-[40px] leading-[1.1]">
            Run your restaurant, not your software.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            The calm, fast back-of-house for modern hospitality — orders, menu, payments and tables
            in one place.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-[14px] text-white/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/20">
                  <Check className="h-3 w-3 text-emerald" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[12px] text-white/40">© 2026 Hostly · Scan. Order. Enjoy.</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}

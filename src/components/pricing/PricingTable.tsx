'use client'

import {Show, SignUpButton} from '@clerk/nextjs'
import {CheckoutButton} from '@clerk/nextjs/experimental'
import {useState} from 'react'

import type {BillingPlan} from '@/lib/billing'

type Period = 'month' | 'annual'

/** Perks a plan gets by virtue of being the app's baseline, not from Clerk. */
const BASELINE_PERKS = [
  'Search one-way and round trips',
  'Full visual seat map',
  'Manage and cancel your bookings',
]

export function PricingTable({
  plans,
  currentPlanSlug,
}: {
  plans: BillingPlan[]
  currentPlanSlug: string | null
}) {
  const [period, setPeriod] = useState<Period>('month')

  const hasAnnualDiscount = plans.some(
    (plan) => plan.annualMonthlyAmount > 0 && plan.annualMonthlyAmount < plan.monthlyAmount,
  )

  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-black/10 p-8 text-center text-sm text-black/60 dark:border-white/10 dark:text-white/60">
        Plans aren&apos;t available right now. Please try again shortly.
      </p>
    )
  }

  return (
    <div>
      {hasAnnualDiscount && (
        <div className="mb-8 flex justify-center">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="flex gap-1 rounded-full bg-black/5 p-1 text-sm font-medium dark:bg-white/10"
          >
            {(['month', 'annual'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={period === value}
                onClick={() => setPeriod(value)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  period === value
                    ? 'bg-foreground text-background'
                    : 'text-black/60 hover:text-foreground dark:text-white/60'
                }`}
              >
                {value === 'month' ? 'Monthly' : 'Annual'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={period}
            isCurrent={plan.slug === currentPlanSlug}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-black/45 dark:text-white/45">
        Ticket purchases are simulated in this demo. PRO membership uses Stripe test mode — card{' '}
        <span className="font-mono">4242 4242 4242 4242</span> works.
      </p>
    </div>
  )
}

function PlanCard({
  plan,
  period,
  isCurrent,
}: {
  plan: BillingPlan
  period: Period
  isCurrent: boolean
}) {
  const isPaid = plan.monthlyAmount > 0
  const highlighted = isPaid

  const formatted = period === 'annual' ? plan.annualMonthlyFormatted : plan.monthlyFormatted
  const savesAnnually = plan.annualMonthlyAmount > 0 && plan.annualMonthlyAmount < plan.monthlyAmount

  // Free tier has no Clerk features attached, so show what the app gives everyone.
  const perks = isPaid
    ? [
        'Everything in Free',
        ...plan.features.map((feature) => feature.description ?? feature.name),
      ]
    : [...BASELINE_PERKS, 'Seat selection charged per seat']

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? 'border-blue-500/40 bg-blue-50/40 dark:border-blue-400/30 dark:bg-blue-950/20'
          : 'border-black/10 dark:border-white/10'
      }`}
    >
      {highlighted && !isCurrent && (
        <span className="absolute -top-2.5 right-6 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Best value
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-2.5 right-6 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
          Current plan
        </span>
      )}

      <p className="text-sm font-semibold uppercase tracking-wide">{plan.name}</p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">
          {plan.currencySymbol}
          {isPaid ? formatted : '0'}
        </span>
        <span className="text-sm text-black/50 dark:text-white/50">
          {isPaid ? '/month' : 'always free'}
        </span>
      </div>

      {isPaid && period === 'annual' && savesAnnually && (
        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Billed annually — {plan.currencySymbol}
          {plan.monthlyFormatted}/month if you pay monthly.
        </p>
      )}

      {plan.description && (
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">{plan.description}</p>
      )}

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-2.5">
            <CheckIcon />
            <span className="text-black/70 dark:text-white/70">{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {isCurrent ? (
          <button
            disabled
            className="w-full cursor-default rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-black/50 dark:border-white/15 dark:text-white/50"
          >
            Your current plan
          </button>
        ) : !isPaid ? (
          <button
            disabled
            className="w-full cursor-default rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-black/50 dark:border-white/15 dark:text-white/50"
          >
            Included by default
          </button>
        ) : (
          <>
            <Show when="signed-in">
              <CheckoutButton
                planId={plan.id}
                planPeriod={period}
                for="user"
                newSubscriptionRedirectUrl="/concierge"
              >
                <button className="w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
                  Upgrade to {plan.name}
                </button>
              </CheckoutButton>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
                  Sign up to get {plan.name}
                </button>
              </SignUpButton>
            </Show>
          </>
        )}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

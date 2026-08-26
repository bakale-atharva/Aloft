'use client'

import {Show, SignUpButton} from '@clerk/nextjs'
import {CheckoutButton} from '@clerk/nextjs/experimental'
import {Check} from 'lucide-react'
import {useState} from 'react'

import {Button} from '@/components/ui/Button'
import {Card} from '@/components/ui/Card'
import {Pill, Badge} from '@/components/ui/Pill'
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
      <Card tone="plain" padding="lg" className="text-center">
        <p className="text-sm text-ink-muted">
          Plans aren&apos;t available right now. Please try again shortly.
        </p>
      </Card>
    )
  }

  return (
    <div>
      {hasAnnualDiscount && (
        <div className="mb-8 flex justify-center">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="flex gap-2"
          >
            {(['month', 'annual'] as const).map((value) => (
              <Pill
                key={value}
                as="button"
                active={period === value}
                role="radio"
                aria-checked={period === value}
                onClick={() => setPeriod(value)}
              >
                {value === 'month' ? 'Monthly' : 'Annual'}
              </Pill>
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

      <p className="mt-6 text-center text-xs text-ink-faint">
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

  const cardContent = (
    <div className="flex flex-col">
      <div className="relative">
        {highlighted && !isCurrent && (
          <span className="absolute -top-4 right-0 bg-gradient-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-accent rounded-full">
            Best value
          </span>
        )}
        {isCurrent && (
          <Badge tone="accent" className="absolute -top-4 right-0">
            Current plan
          </Badge>
        )}
      </div>

      <p className="font-display text-ink uppercase text-xs font-semibold tracking-wide">{plan.name}</p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-5xl font-semibold text-ink">
          {plan.currencySymbol}
          {isPaid ? formatted : '0'}
        </span>
        <span className="text-sm text-ink-muted">
          {isPaid ? '/month' : 'always free'}
        </span>
      </div>

      {isPaid && period === 'annual' && savesAnnually && (
        <p className="mt-1 text-xs text-accent-600">
          Billed annually — {plan.currencySymbol}
          {plan.monthlyFormatted}/month if you pay monthly.
        </p>
      )}

      {plan.description && (
        <p className="mt-3 text-sm text-ink-muted">{plan.description}</p>
      )}

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-2.5">
            <Check className="size-4 shrink-0 text-accent-600" strokeWidth={2.5} />
            <span className="text-ink-muted">{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {isCurrent ? (
          <Button variant="outline" disabled className="w-full">
            Your current plan
          </Button>
        ) : !isPaid ? (
          <Button variant="outline" disabled className="w-full">
            Included by default
          </Button>
        ) : (
          <>
            <Show when="signed-in">
              <CheckoutButton
                planId={plan.id}
                planPeriod={period}
                for="user"
                newSubscriptionRedirectUrl="/concierge"
              >
                <Button variant="primary" size="lg" className="w-full">
                  Upgrade to {plan.name}
                </Button>
              </CheckoutButton>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button variant="primary" size="lg" className="w-full">
                  Sign up to get {plan.name}
                </Button>
              </SignUpButton>
            </Show>
          </>
        )}
      </div>
    </div>
  )

  if (highlighted) {
    return (
      <div className="rounded-card bg-gradient-brand p-px shadow-float">
        <div className="rounded-[calc(1.5rem-1px)] bg-surface p-8">
          {cardContent}
        </div>
      </div>
    )
  }

  return (
    <Card tone="plain" padding="lg">
      {cardContent}
    </Card>
  )
}


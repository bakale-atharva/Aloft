import {PricingTable} from '@/components/pricing/PricingTable'
import {ConciergeChat} from '@/components/concierge/ConciergeChat'
import {getUserPlans, resolveCurrentPlanSlug} from '@/lib/billing'
import {getEntitlements} from '@/lib/entitlements'

export default async function ConciergePage() {
  const {canUseConcierge, userId, isPro} = await getEntitlements()

  if (!canUseConcierge) {
    const plans = await getUserPlans()
    const currentPlanSlug = resolveCurrentPlanSlug(plans, {userId, isPro})

    return (
      <div className="flex flex-1 flex-col">
        <section className="hero-wash border-b border-border px-6 py-14 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">AI concierge is a PRO feature</h1>
          <p className="mt-3 text-ink-muted">
            Upgrade to Aloft PRO to chat your way through search, seat picks, and bookings.
          </p>
        </section>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
          <PricingTable plans={plans} currentPlanSlug={currentPlanSlug} />
        </div>
      </div>
    )
  }

  return <ConciergeChat userId={userId} />
}

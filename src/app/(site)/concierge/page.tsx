import {PricingTable} from '@/components/pricing/PricingTable'
import {ConciergeChat} from '@/components/concierge/ConciergeChat'
import {getUserPlans} from '@/lib/billing'
import {getEntitlements} from '@/lib/entitlements'

export default async function ConciergePage() {
  const {canUseConcierge, isPro} = await getEntitlements()

  if (!canUseConcierge) {
    const plans = await getUserPlans()

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">AI concierge is a PRO feature</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            Upgrade to Aloft PRO to chat your way through search, seat picks, and bookings.
          </p>
        </div>
        <PricingTable plans={plans} currentPlanSlug={isPro ? 'pro' : null} />
      </div>
    )
  }

  return <ConciergeChat />
}

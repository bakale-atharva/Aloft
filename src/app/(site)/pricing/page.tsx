import {PricingTable} from '@/components/pricing/PricingTable'
import {getUserPlans, resolveCurrentPlanSlug} from '@/lib/billing'
import {getEntitlements} from '@/lib/entitlements'

export default async function PricingPage() {
  const [plans, {userId, isPro}] = await Promise.all([getUserPlans(), getEntitlements()])
  const currentPlanSlug = resolveCurrentPlanSlug(plans, {userId, isPro})

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Choose your plan</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          PRO members skip seat-selection fees and get access to the AI concierge desk.
        </p>
      </div>

      <PricingTable plans={plans} currentPlanSlug={currentPlanSlug} />
    </div>
  )
}

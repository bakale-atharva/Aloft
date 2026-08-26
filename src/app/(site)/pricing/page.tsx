import {PricingTable} from '@/components/pricing/PricingTable'
import {getUserPlans, resolveCurrentPlanSlug} from '@/lib/billing'
import {getEntitlements} from '@/lib/entitlements'

export default async function PricingPage() {
  const [plans, {userId, isPro}] = await Promise.all([getUserPlans(), getEntitlements()])
  const currentPlanSlug = resolveCurrentPlanSlug(plans, {userId, isPro})

  return (
    <div className="flex flex-1 flex-col">
      <section className="hero-wash border-b border-border px-6 py-14 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Choose your plan</h1>
        <p className="mt-3 text-ink-muted">
          PRO members skip seat-selection fees and get access to the AI concierge desk.
        </p>
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
        <PricingTable plans={plans} currentPlanSlug={currentPlanSlug} />
      </div>
    </div>
  )
}

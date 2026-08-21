import {PricingTable} from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Choose your plan</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          PRO members skip seat-selection fees and get access to the AI concierge desk.
        </p>
      </div>
      <PricingTable />
    </div>
  )
}

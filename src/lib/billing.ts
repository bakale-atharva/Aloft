import 'server-only'

const PLANS_ENDPOINT = 'https://api.clerk.com/v1/billing/plans?payer_type=user'

export type BillingFeature = {
  slug: string
  name: string
  description: string | null
}

export type BillingPlan = {
  id: string
  slug: string
  name: string
  description: string | null
  isDefault: boolean
  /** Monthly price in minor units (cents). */
  monthlyAmount: number
  monthlyFormatted: string
  /** Monthly-equivalent price when billed annually, in minor units. */
  annualMonthlyAmount: number
  annualMonthlyFormatted: string
  currencySymbol: string
  features: BillingFeature[]
}

type RawFee = {
  amount: number
  amount_formatted: string
  currency: string
  currency_symbol: string
}

type RawPlan = {
  id: string
  slug: string
  name: string
  description: string | null
  is_default: boolean
  publicly_visible: boolean
  fee: RawFee
  annual_monthly_fee: RawFee
  features?: {slug: string; name: string; description: string | null}[]
}

/**
 * Plan definitions live in Clerk, not in this repo — pricing and feature
 * copy are edited there and read here, so the two can never drift.
 *
 * The Backend API is used rather than rendering Clerk's own `<PricingTable />`
 * so the cards can match the rest of the site. Checkout itself still goes
 * through Clerk's drawer via `<CheckoutButton />`.
 */
/**
 * Which plan the viewer is on. Signed-in users with no subscription are on
 * the instance's default (free) plan, not on "no plan" — signed-out visitors
 * get null so nothing is marked as theirs.
 */
export function resolveCurrentPlanSlug(
  plans: BillingPlan[],
  {userId, isPro}: {userId: string | null; isPro: boolean},
): string | null {
  if (!userId) return null
  if (isPro) return 'pro'
  return plans.find((plan) => plan.isDefault)?.slug ?? null
}

export async function getUserPlans(): Promise<BillingPlan[]> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) return []

  const res = await fetch(PLANS_ENDPOINT, {
    headers: {Authorization: `Bearer ${secretKey}`},
    // Pricing changes rarely, but shouldn't need a redeploy to show up.
    next: {revalidate: 300},
  })

  if (!res.ok) return []

  const body = (await res.json()) as {data?: RawPlan[]}

  return (body.data ?? [])
    .filter((plan) => plan.publicly_visible)
    .map(
      (plan): BillingPlan => ({
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        isDefault: plan.is_default,
        monthlyAmount: plan.fee.amount,
        monthlyFormatted: plan.fee.amount_formatted,
        annualMonthlyAmount: plan.annual_monthly_fee.amount,
        annualMonthlyFormatted: plan.annual_monthly_fee.amount_formatted,
        currencySymbol: plan.fee.currency_symbol || '$',
        features: (plan.features ?? []).map((feature) => ({
          slug: feature.slug,
          name: feature.name,
          description: feature.description,
        })),
      }),
    )
    .sort((a, b) => a.monthlyAmount - b.monthlyAmount)
}

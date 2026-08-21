import {auth} from '@clerk/nextjs/server'

/**
 * Centralizes the PRO feature checks so every gate (checkout, /concierge,
 * the API route) reads the same slugs. Plan/feature slugs are defined in
 * Clerk Dashboard -> Billing: plan "pro" carries "free_seat_selection" and
 * "ai_concierge".
 */
export async function getEntitlements() {
  const {userId, has} = await auth()

  return {
    userId,
    isPro: has?.({plan: 'pro'}) ?? false,
    canUseConcierge: has?.({feature: 'ai_concierge'}) ?? false,
    seatFeesWaived: has?.({feature: 'free_seat_selection'}) ?? false,
  }
}

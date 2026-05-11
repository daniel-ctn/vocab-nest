import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your .env.local file.'
    )
  }

  _stripe = new Stripe(key, {
    typescript: true,
  })

  return _stripe
}

export function getStripePriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    throw new Error(
      'STRIPE_PRICE_ID is not set. Add it to your .env.local file.'
    )
  }
  return priceId
}

export function getStripeAnnualPriceId(): string | undefined {
  return process.env.STRIPE_ANNUAL_PRICE_ID
}

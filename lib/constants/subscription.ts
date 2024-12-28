export const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: "Basic",
    price: 299,
    maxBookings: 50,
    features: [
      "50 bookings per month",
      "1 activity location",
      "Basic analytics",
      "Email support",
      "Basic calendar features"
    ]
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 599,
    maxBookings: 200,
    features: [
      "200 bookings per month",
      "Multiple locations",
      "Advanced analytics",
      "Priority support",
      "Advanced calendar features",
      "Custom branding"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 999,
    maxBookings: Infinity,
    features: [
      "Unlimited bookings",
      "Unlimited locations",
      "Custom analytics",
      "Dedicated support",
      "All calendar features",
      "White-label solution",
      "API access"
    ]
  }
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

export const NEXT_TIER: Partial<Record<SubscriptionTier, SubscriptionTier>> = {
  BASIC: 'PROFESSIONAL',
  PROFESSIONAL: 'ENTERPRISE'
}

export const PREVIOUS_TIER: Partial<Record<SubscriptionTier, SubscriptionTier>> = {
  PROFESSIONAL: 'BASIC',
  ENTERPRISE: 'PROFESSIONAL'
} 
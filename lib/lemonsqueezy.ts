import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
  onError: (error) => console.error("Lemon Squeezy Error:", error),
});

export const lemonSqueezy = { createCheckout };
export const LEMON_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
export const LEMON_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID; 
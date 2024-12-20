import { NextResponse } from "next/server";
import { processSuccessfulCheckout } from "@/app/services/checkout-payments";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // Verify webhook signature
    const signature = headers().get("x-signature");
    const body = await req.text();
    const hmac = crypto
      .createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature !== hmac) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle order successful event
    if (event.meta.event_name === "order_created") {
      const { custom_data } = event.data.attributes;
      
      if (custom_data?.cartId && custom_data?.userId) {
        await processSuccessfulCheckout(
          event.data.id,
          custom_data.userId,
          custom_data.cartId
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
} 
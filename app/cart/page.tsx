"use client";

import { MultiCartView } from "../components/MultiCartView";
import { CheckoutButton } from "../components/SubmitButtons";
import Script from "next/script";
import { toast } from "react-hot-toast";

export default function CartPage() {
  async function handleCheckout() {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to checkout");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to checkout"
      );
    }
  }

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" />
      <div className="flex flex-col items-center container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <MultiCartView />
        <form action={handleCheckout} className="w-full max-w-md mt-6">
          <CheckoutButton />
        </form>
      </div>
    </>
  );
}

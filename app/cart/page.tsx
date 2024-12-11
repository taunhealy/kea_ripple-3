"use client";

import { MultiCartView } from "../components/MultiCartView";
import { CheckoutButton } from "../components/SubmitButtons";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function CartPage() {
  const router = useRouter();

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
        window.location.href = data.url; // Redirect to Stripe checkout
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to checkout"
      );
    }
  }

  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <MultiCartView />
      <form action={handleCheckout} className="w-full max-w-md mt-6">
        <CheckoutButton />
      </form>
    </div>
  );
}

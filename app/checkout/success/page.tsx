import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CheckoutStatus from "@/app/components/CheckoutStatus";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { processSuccessfulCheckout } from "@/app/services/checkout-payments";

export default async function CheckoutSuccessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <CheckoutStatus
      status="success"
      message="Payment successful! Redirecting to your downloads..."
      redirect="/presets?view=downloaded"
    />
  );
}
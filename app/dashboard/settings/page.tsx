"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { UsernameSettings } from "@/app/components/settings/UsernameSettings";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ConnectLemonSqueezyForm } from "@/app/components/settings/ConnectLemonSqueezyForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      username: true,
      stripeAccountId: true,
      lemonSqueezyStoreId: true,
    },
  });

  const router = useRouter();

  const deleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const startStripeConnect = async () => {
    try {
      const response = await fetch('/api/connect');
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.details || data.error);
      }
    } catch (error) {
      console.error('Failed to start Stripe Connect:', error);
      toast.error('Failed to connect with Stripe. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        <UsernameSettings />

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Danger Zone
          </h2>
          <Button onClick={deleteAccount} variant="destructive">
            Delete Account
          </Button>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-4">Payment Processing</h2>
          <p className="text-muted-foreground mb-4">
            Choose how you want to receive payments for your presets.
          </p>

          <Tabs defaultValue="stripe" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stripe">Stripe Connect</TabsTrigger>
              <TabsTrigger value="lemonsqueezy">Lemon Squeezy</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe">
              <div className="space-y-4">
                <h3 className="font-medium">Stripe Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Receive payments directly to your bank account with Stripe Connect.
                  {user?.stripeAccountId && " (Connected)"}
                </p>
                <Button 
                  onClick={startStripeConnect}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {user?.stripeAccountId ? "Update Stripe Account" : "Connect with Stripe"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="lemonsqueezy">
              <div className="space-y-4">
                <h3 className="font-medium">Lemon Squeezy</h3>
                <p className="text-sm text-muted-foreground">
                  Use your Lemon Squeezy store to process payments.
                  {user?.lemonSqueezyStoreId && " (Connected)"}
                </p>
                <ConnectLemonSqueezyForm 
                  storeId={user?.lemonSqueezyStoreId} 
                  userId={session.user.id} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

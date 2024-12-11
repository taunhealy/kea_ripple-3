"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutStatus({ 
  status, 
  message, 
  redirect 
}: { 
  status: "success" | "error",
  message: string,
  redirect: string 
}) {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      console.log("CheckoutStatus: Starting redirect process", { status, message, redirect });
      
      if (status === "success") {
        toast.success(message);
        // Add a delay before redirect
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("CheckoutStatus: Redirecting to", redirect);
        window.location.href = redirect; // Use window.location.href instead of router.push
      } else {
        toast.error(message);
      }
    };

    handleRedirect();
  }, [status, message, redirect]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">
          {status === "success" ? "Payment Successful!" : "Payment Failed"}
        </h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
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
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.replace(redirect);
  }, [status, message, redirect, router]);

  return null;
}

"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "react-hot-toast";

interface Props {
  storeId?: string | null;
  userId: string;
}

export function ConnectLemonSqueezyForm({ storeId, userId }: Props) {
  const [newStoreId, setNewStoreId] = useState(storeId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/lemon-squeezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: newStoreId }),
      });
      
      if (!response.ok) throw new Error("Failed to update");
      toast.success("Store ID updated successfully");
    } catch (error) {
      toast.error("Failed to update store ID");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={newStoreId}
        onChange={(e) => setNewStoreId(e.target.value)}
        placeholder="Enter Lemon Squeezy Store ID"
      />
      <Button type="submit">
        {storeId ? "Update Store ID" : "Connect Store"}
      </Button>
    </form>
  );
} 
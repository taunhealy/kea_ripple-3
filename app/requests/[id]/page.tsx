"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PresetRequestCard } from "@/app/components/PresetRequestCard";
import { useSession } from "next-auth/react";

export default function RequestPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();

  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequests/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading request</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <PresetRequestCard request={request} currentUserId={session?.user?.id} />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { RequestForm } from "@/app/components/dashboard/RequestForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;

  const { data: requestData, isLoading } = useQuery({
    queryKey: ["presetRequest", requestId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/presetRequests/${requestId}`);
        if (response.status === 404) {
          toast.error("Request not found");
          router.push("/dashboard/requests");
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch request");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching request:", error);
        toast.error("Error loading request");
        router.push("/dashboard/requests");
        return null;
      }
    },
    retry: false,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!requestData) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/requests">
        <Button variant="outline">← Back to Requests</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Edit Request</h1>
      <RequestForm initialData={requestData} requestId={requestId} />
    </div>
  );
}

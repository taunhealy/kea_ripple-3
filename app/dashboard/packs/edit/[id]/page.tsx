"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PresetPackForm } from "@/app/components/dashboard/PresetPackForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function EditPackPage() {
  const params = useParams();
  const packId = params?.id as string;

  const { data: pack, isLoading } = useQuery({
    queryKey: ["presetPack", packId],
    queryFn: async () => {
      const response = await fetch(`/api/presetPacks/${packId}`);
      if (!response.ok) throw new Error("Failed to fetch pack");
      const data = await response.json();
      console.log("Fetched pack data:", data);
      return data;
    },
    staleTime: 30000, // Keep the data fresh for 30 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (!pack) return <div>Pack not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/packs">
        <Button variant="outline">← Back to Packs</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Edit Preset Pack</h1>
      <PresetPackForm initialData={pack} packId={packId} />
    </div>
  );
}

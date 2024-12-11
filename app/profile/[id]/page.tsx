"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { PresetCard } from "@/app/components/PresetCard";
import { RequestCard } from "@/app/components/dashboard/RequestCard";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/sound-designers/user/${userId}/profile`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
  });

  const { data: presets = [], isLoading: isLoadingPresets } = useQuery({
    queryKey: ["userPresets", userId],
    queryFn: async () => {
      const response = await fetch(`/api/presetUploads?soundDesignerId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch presets");
      }
      return response.json();
    },
  });

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["userRequests", userId],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequest?type=requested&userId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  if (isLoadingUser) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!userData) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{userData.username}'s Profile</h1>
      </div>

      <Tabs defaultValue="presets">
        <TabsList>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="presets">
          {isLoadingPresets ? (
            <div>Loading presets...</div>
          ) : presets.length === 0 ? (
            <div>No presets found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset: any) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {isLoadingRequests ? (
            <div>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div>No requests found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request: any) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  type="requested"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

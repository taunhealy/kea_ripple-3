"use client";

import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { MusicIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export function SpotifyConnectButton() {
  const { data: session } = useSession();

  const handleConnect = async () => {
    try {
      const response = await fetch("/api/spotify/auth");
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Auth error:", data);
        throw new Error(data.error || "Failed to connect to Spotify");
      }
      
      if (data.url) {
        // Redirect to Spotify OAuth page
        window.location.href = data.url;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to Spotify");
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      className="flex items-center gap-2"
    >
      <MusicIcon className="h-4 w-4" />
      Connect Spotify
    </Button>
  );
} 
"use client";

import { useQuery } from "@tanstack/react-query";
import { SpotifyConnectButton } from "./SpotifyConnectButton";
import { MusicIcon } from "lucide-react";

interface SpotifyResponse {
  name?: string;
  artist?: string;
  albumArt?: string;
  isConnected?: boolean;
  playing?: boolean;
  error?: string;
}

export function SpotifyStatus() {
  const { data, error, isError } = useQuery<SpotifyResponse>({
    queryKey: ["spotify-current-track"],
    queryFn: async () => {
      const response = await fetch("/api/spotify/current-track");
      console.log("Spotify API Response Status:", response.status);
      
      const data = await response.json();
      console.log("Raw API Response:", data);
      
      if (!data) {
        return { isConnected: false };
      }
      
      return data;
    },
    refetchInterval: 10000,
    retry: false,
    refetchOnWindowFocus: true
  });

  console.log("Component State:", {
    data,
    error: error instanceof Error ? error.message : error,
    isError
  });

  // Show connect button if not connected
  if (!data?.isConnected) {
    return <SpotifyConnectButton />;
  }

  // Show "Not Playing" state if connected but no track
  if (!data.name || !data.artist) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MusicIcon className="h-4 w-4" />
        <span>Not Playing</span>
      </div>
    );
  }

  // Show track info
  return (
    <div className="flex items-center gap-3">
      {data.albumArt ? (
        <img 
          src={data.albumArt} 
          alt="Album art" 
          className="h-8 w-8 rounded"
        />
      ) : (
        <MusicIcon className="h-5 w-5 text-muted-foreground" />
      )}
      <div className="hidden md:block">
        <p className="text-sm font-medium leading-none">{data.name}</p>
        <p className="text-sm text-muted-foreground">{data.artist}</p>
      </div>
    </div>
  );
} 
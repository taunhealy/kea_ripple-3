import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MusicIcon } from "lucide-react";

interface SpotifyUser {
  id: string;
  username: string;
  image?: string;
  currentTrack?: {
    name: string;
    artist: string;
    albumArt?: string;
  };
  isOnline: boolean;
}

export function SpotifyUserList() {
  const { data: users, isLoading } = useQuery<SpotifyUser[]>({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      const response = await fetch("/api/users/spotify-status");
      if (!response.ok) {
        throw new Error("Failed to fetch online users");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MusicIcon className="h-5 w-5" />
          Now Playing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.filter(user => user.isOnline).map((user) => (
            <div key={user.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                {user.currentTrack ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{user.currentTrack.name}</span>
                    <span className="mx-1">•</span>
                    <span>{user.currentTrack.artist}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not playing</p>
                )}
              </div>
              {user.currentTrack?.albumArt && (
                <img 
                  src={user.currentTrack.albumArt} 
                  alt="Album art"
                  className="h-12 w-12 rounded-md" 
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
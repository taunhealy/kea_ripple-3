import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        image: true,
        spotifyAccessToken: true,
        lastSeen: true,
      },
    });

    const onlineUsers = await Promise.all(
      users.map(async (user) => {
        let currentTrack = null;
        const isOnline = user.lastSeen && 
          new Date().getTime() - new Date(user.lastSeen).getTime() < 5 * 60 * 1000;

        if (user.spotifyAccessToken && isOnline) {
          try {
            const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
              headers: {
                Authorization: `Bearer ${user.spotifyAccessToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              currentTrack = {
                name: data.item.name,
                artist: data.item.artists[0].name,
                albumArt: data.item.album.images[0]?.url,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch Spotify status for user ${user.id}:`, error);
          }
        }

        return {
          id: user.id,
          username: user.username,
          image: user.image,
          currentTrack,
          isOnline,
        };
      })
    );

    return NextResponse.json(onlineUsers);
  } catch (error) {
    console.error("Error fetching user Spotify status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
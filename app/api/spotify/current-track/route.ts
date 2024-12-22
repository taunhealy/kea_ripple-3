import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshSpotifyToken(refreshToken: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log({
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      console.log("No valid session found");
      return NextResponse.json(null);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        spotifyAccessToken: true,
        email: true 
      },
    });
    
    console.log({
      userFound: !!user,
      hasSpotifyToken: !!user?.spotifyAccessToken,
      userEmail: user?.email
    });

    if (!user?.spotifyAccessToken) {
      console.log("No Spotify access token found");
      return NextResponse.json(null);
    }

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${user.spotifyAccessToken}`,
      },
    });
    
    console.log("Spotify API response status:", response.status);

    if (response.status === 204) {
      console.log("No track currently playing (204 status)");
      return NextResponse.json({
        isConnected: true,
        playing: false
      });
    }

    if (!response.ok) {
      console.log("Failed to fetch from Spotify API:", response.status);
      return NextResponse.json({
        isConnected: false,
        error: `API Error: ${response.status}`
      });
    }

    const data = await response.json();
    console.log("Spotify track data:", {
      name: data.item?.name,
      artist: data.item?.artists?.[0]?.name,
      hasAlbumArt: !!data.item?.album?.images?.[0]?.url
    });
    
    if (!data.item) {
      console.log("No track item in response");
      return NextResponse.json(null);
    }

    return NextResponse.json({
      name: data.item.name,
      artist: data.item.artists[0].name,
      albumArt: data.item.album.images[0]?.url,
    });
  } catch (error) {
    console.error("Error fetching current track:", error);
    return NextResponse.json(null);
  }
} 
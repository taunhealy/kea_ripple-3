import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

export async function GET() {
  try {
    // Log environment variables (redacted for security)
    console.log("Auth configuration:", {
      hasClientId: !!SPOTIFY_CLIENT_ID,
      redirectUri: SPOTIFY_REDIRECT_URI,
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("No valid session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate random state string for security
    const state = Math.random().toString(36).substring(7);

    // Scopes we want to request
    const scope = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-read-email'
    ].join(' ');

    // Verify all required values are present
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
      console.error("Missing required environment variables:", {
        hasClientId: !!SPOTIFY_CLIENT_ID,
        hasRedirectUri: !!SPOTIFY_REDIRECT_URI
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    try {
      // Store state in session for verification
      await prisma.user.update({
        where: { id: session.user.id },
        data: { spotifyState: state }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Create Spotify authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log("Generated auth URL (redacted):", authUrl.replace(SPOTIFY_CLIENT_ID, 'REDACTED'));
    
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Spotify auth error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Spotify auth", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 
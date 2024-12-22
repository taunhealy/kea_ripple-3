import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect('/login');
    }

    // Verify state matches
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { spotifyState: true }
    });

    if (state !== user?.spotifyState) {
      return NextResponse.redirect('/error?message=invalid_state');
    }

    // Exchange code for access token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    const tokens = await response.json();

    // Store tokens in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token,
        spotifyState: null, // Clear the state
      },
    });

    // Redirect back to the app
    return NextResponse.redirect('/dashboard');
  } catch (error) {
    console.error("Spotify callback error:", error);
    return NextResponse.redirect('/error?message=spotify_auth_failed');
  }
} 
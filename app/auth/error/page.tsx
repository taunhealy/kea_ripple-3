"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const errorMessages: { [key: string]: string } = {
    OAuthSignin: "Error signing in with Google. Please try again.",
    OAuthCallback: "Error during authentication callback.",
    OAuthCreateAccount: "Could not create user account.",
    EmailCreateAccount: "Could not create user account.",
    Callback: "Error during authentication callback.",
    OAuthAccountNotLinked: "Email is already linked to another account.",
    default: "An error occurred during authentication."
  };

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">{message}</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
} 
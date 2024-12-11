"use client";

import { RequestForm } from "@/app/components/dashboard/RequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function HelpPostCreateRoute() {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  // Redirect or show message if not authenticated
  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to create a help request
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Help Post</CardTitle>
        <CardDescription>
          Ask for help to create a specific Preset sound
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequestForm />
      </CardContent>
    </Card>
  );
}

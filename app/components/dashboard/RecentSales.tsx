"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

type OrderData = {
  id: string;
  amount: number;
  sound_designer: {
    firstName: string;
    profileImage: string | null;
    email: string;
  };
};

export function RecentSales() {
  const { data, isLoading } = useQuery({
    queryKey: ["recentSales"],
    queryFn: async () => {
      const response = await fetch("/api/sales/recent");
      if (!response.ok) {
        throw new Error("Failed to fetch recent sales");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent sales</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data?.map((item: OrderData) => (
          <div className="flex items-center gap-4" key={item.id}>
            <Avatar className="hidden sm:flex h-9 w-9">
              <AvatarImage
                src={item.sound_designer.profileImage ?? ""}
                alt="Avatar Image"
              />
              <AvatarFallback>
                {item.sound_designer.firstName.slice(0, 3)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium">
                {item.sound_designer.firstName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.sound_designer.email}
              </p>
            </div>
            <p className="ml-auto font-medium">
              +${new Intl.NumberFormat("en-US").format(item.amount / 100)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

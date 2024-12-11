"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";
import { Session } from "next-auth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";

// Define schema
const usernameSchema = z.object({
  username: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{3,20}$/,
      "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens"
    ),
});

export function UsernameSettings() {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: session?.user?.name || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof usernameSchema>) => {
      const response = await fetch("/api/user/update-username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Username updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update username"
      );
    },
  });

  const onSubmit = (values: z.infer<typeof usernameSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Username Settings</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              form.getValues("username") === session?.user?.name
            }
          >
            {mutation.isPending ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

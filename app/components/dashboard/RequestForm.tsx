"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional(),
  genreId: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  initialData?: RequestFormData;
  requestId?: string;
}

export function RequestForm({ initialData, requestId }: RequestFormProps) {
  const [selectedGenre, setSelectedGenre] = useState(
    initialData?.genreId || ""
  );
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user?.id) {
    router.push("/auth/signin");
    return null;
  }

  const welcomeMessage = (
    <div className="mb-6 text-sm text-muted-foreground">
      Hi {session.user.name || "there"}, you have successfully authenticated.

    </div>
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: initialData,
  });

  const mutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to create a request");
      }

      console.log("Form submission - requestId:", requestId);
      console.log("User ID:", session.user.id);

      const endpoint = requestId
        ? `/api/presetRequests/${requestId}`
        : `/api/presetRequests/create`;

      console.log("Sending request to:", endpoint);
      console.log("Method:", requestId ? "PATCH" : "POST");
      console.log("Data:", {
        title: data.title,
        youtubeLink: data.youtubeLink,
        genreId: selectedGenre,
        enquiryDetails: data.enquiryDetails,
        userId: session.user.id,
      });

      const response = await fetch(endpoint, {
        method: requestId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          youtubeLink: data.youtubeLink,
          genreId: selectedGenre,
          enquiryDetails: data.enquiryDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Response error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData?.error || `Failed to save request: ${response.statusText}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presetRequests"] });
      queryClient.invalidateQueries({ queryKey: ["presetRequest", requestId] });
      toast.success("Request saved successfully");
      router.push("/dashboard/requests");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to save request");
    },
  });

  const onSubmit = (data: RequestFormData) => {
    mutation.mutate(data);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setValue("genreId", value);
  };

  return (
    <>
      {welcomeMessage}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input {...register("title")} />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            YouTube Reference Link (Optional)
          </label>
          <Input {...register("youtubeLink")} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <GenreCombobox value={selectedGenre} onChange={handleGenreChange} />
          {errors.genreId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.genreId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Enquiry Details
          </label>
          <Textarea {...register("enquiryDetails")} />
          {errors.enquiryDetails && (
            <p className="text-red-500 text-sm mt-1">
              {errors.enquiryDetails.message}
            </p>
          )}
        </div>

        <Button type="submit">Save Request</Button>
      </form>
    </>
  );
}

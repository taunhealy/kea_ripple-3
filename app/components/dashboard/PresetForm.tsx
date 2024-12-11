"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { FileIcon, X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPresetFileName } from "@/utils/presetNaming";
import { PresetType, PriceType } from "@prisma/client";

interface PresetFormProps {
  initialData?: any;
  presetId?: string | null;
}

const presetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  guide: z.string().optional(),
  spotifyLink: z.string().optional(),
  genreId: z.string().min(1, "Genre is required"),
  vstId: z.string().min(1, "VST is required"),
  priceType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  presetType: z.enum(["PAD", "LEAD", "PLUCK", "BASS", "FX", "OTHER"]),
  price: z.number().min(0),
  presetFileUrl: z.string().min(1, "Preset file is required"),
  originalFileName: z.string().optional(),
  soundPreviewUrl: z.string().optional(),
  referenceTrackUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      "Must be a valid YouTube URL"
    )
    .optional()
    .nullable(),
});

type PresetFormData = z.infer<typeof presetSchema>;

interface VST {
  id: string;
  name: string;
}

export function PresetForm({ initialData, presetId }: PresetFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [presetFile, setPresetFile] = useState<string | null>(
    initialData?.presetFileUrl || null
  );
  const [soundPreview, setSoundPreview] = useState<string | null>(
    initialData?.soundPreviewUrl || null
  );

  const { data: vsts, isLoading: isLoadingVsts } = useQuery<VST[]>({
    queryKey: ["vsts"],
    queryFn: async () => {
      const response = await fetch("/api/vsts");
      if (!response.ok) throw new Error("Failed to fetch VSTs");
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      guide: initialData?.guide || "",
      spotifyLink: initialData?.spotifyLink || "",
      genreId: initialData?.genreId || "",
      vstId: initialData?.vstId || "",
      priceType: initialData?.priceType || "FREE",
      presetType: initialData?.presetType || "LEAD",
      price: initialData?.price || 0,
      presetFileUrl: initialData?.presetFileUrl || "",
      originalFileName: initialData?.originalFileName || "",
      soundPreviewUrl: initialData?.soundPreviewUrl || "",
      referenceTrackUrl: initialData?.referenceTrackUrl || null,
    },
  });

  // Check session and bounce if user isn't authed
  console.log("Session:", session?.user);
  useEffect(() => {
    if (!session?.user?.id) {
      toast.error("Please sign in to create presets");
      router.push("/sign-in");
    }
  }, [session, router]);
  
  const mutation = useMutation({
    mutationFn: async (data: PresetFormData) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("Current user ID:", session.user.id);

      const endpoint = presetId ? `/api/presets/${presetId}` : "/api/presets";
      const method = presetId ? "PATCH" : "POST";

      const formData = {
        ...data,
        userId: session.user.id,
      };

      console.log("Submitting form data:", formData);

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          throw new Error(
            errorData.message || errorData.error || "Server validation failed"
          );
        }

        return response.json();
      } catch (error) {
        console.error("Full error details:", error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      if (error.message === "User not authenticated") {
        toast.error("Please sign in to create presets");
        router.push("/sign-in");
        return;
      }
      toast.error(error.message || "Failed to save preset");
    },
    onSuccess: () => {
      toast.success(`Preset ${presetId ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      router.push("/presets");
    },
  });

  const onSubmit = (data: PresetFormData) => {
    if (!data.title) {
      toast.error("Title is required");
      return;
    }
    if (!data.genreId) {
      toast.error("Genre is required");
      return;
    }
    if (!data.vstId) {
      toast.error("VST is required");
      return;
    }
    if (!data.presetFileUrl) {
      toast.error("Preset file is required");
      return;
    }

    const formattedFileName = formatPresetFileName(data.title, data.presetType);
    
    console.log("Form data before submission:", {
      ...data,
      originalFileName: formattedFileName,
    });

    mutation.mutate({
      ...data,
      originalFileName: formattedFileName,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input {...register("title")} id="title" />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea {...register("description")} id="description" />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

// Genre
      <div className="space-y-2">
        <Label>Genre</Label>
        <Controller
          name="genreId"
          control={control}
          render={({ field }) => (
            <GenreCombobox value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.genreId && (
          <p className="text-sm text-red-500">{errors.genreId.message}</p>
        )}
      </div>

// VST
      <div className="space-y-2">
        <Label>VST</Label>
        <Controller
          name="vstId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select VST" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingVsts ? (
                  <SelectItem value="loading">Loading VSTs...</SelectItem>
                ) : !vsts || vsts.length === 0 ? (
                  <SelectItem value="no-vsts">No VSTs available</SelectItem>
                ) : (
                  vsts.map((vst) => (
                    <SelectItem key={vst.id} value={vst.id}>
                      {vst.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.vstId && (
          <p className="text-sm text-red-500">{errors.vstId.message}</p>
        )}
      </div>

// Preset Type
      <div className="space-y-2">
        <Label>Preset Type</Label>
        <Controller
          name="presetType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PresetType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.presetType && (
          <p className="text-sm text-red-500">{errors.presetType.message}</p>
        )}
      </div>

// Preset File
      <div className="space-y-4">
        <div>
          <Label>Preset File</Label>
          {!presetFile ? (
            <UploadDropzone
              endpoint="presetUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setPresetFile(res[0].url);
                  setValue("presetFileUrl", res[0].url);
                  setValue("originalFileName", res[0].name || "preset-file");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Error uploading preset: ${error.message}`);
              }}
            />
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <FileIcon className="h-4 w-4" />
              <span className="text-sm truncate">
                {watch("originalFileName")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPresetFile(null);
                  setValue("presetFileUrl", "");
                  setValue("originalFileName", "");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label>Sound Preview</Label>
          {!soundPreview ? (
            <UploadDropzone
              endpoint="audioUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setSoundPreview(res[0].url);
                  setValue("soundPreviewUrl", res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Error uploading audio: ${error.message}`);
              }}
            />
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <FileIcon className="h-4 w-4" />
              <span className="text-sm">Preview Audio</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSoundPreview(null);
                  setValue("soundPreviewUrl", "");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

// Price Type
      <div className="space-y-2">
        <Label>Price Type</Label>
        <Controller
          name="priceType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select price type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PriceType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {watch("priceType") === "PREMIUM" && (
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? "Saving..."
          : presetId
          ? "Update Preset"
          : "Create Preset"}
      </Button>
    </form>
  );
}

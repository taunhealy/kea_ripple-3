import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

interface PresetPackFormProps {
  initialData?: {
    title: string;
    description?: string;
    price: number;
    presets: { preset: { id: string; price: number; title: string } }[];
  };
  packId?: string;
}

const presetPackSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .transform((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .refine((val) => val.charAt(0) === val.charAt(0).toUpperCase(), {
      message: "Title must start with a capital letter",
    }),
  description: z
    .string()
    .optional()
    .transform((str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : str
    )
    .refine((val) => !val || val.charAt(0) === val.charAt(0).toUpperCase(), {
      message: "Description must start with a capital letter",
    }),
  price: z.number().min(5, "Price must be at least $5"),
  presetIds: z
    .array(z.string())
    .length(5, "Pack must contain exactly 5 presets"),
});

type PresetPackFormData = z.infer<typeof presetPackSchema>;

export function PresetPackForm({ initialData, packId }: PresetPackFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPresets, setSelectedPresets] = useState<
    Array<{
      id: string;
      price: number;
      title: string;
    }>
  >(
    initialData?.presets.map((p) => ({
      id: p.preset.id,
      price: p.preset.price,
      title: p.preset.title,
    })) || []
  );

  // Calculate total price of individual presets
  const totalPresetsPrice = selectedPresets.reduce(
    (sum, preset) => sum + preset.price,
    0
  );

  // Query to get user's uploaded presets
  const {
    data: userPresets,
    isLoading: isLoadingPresets,
    error,
  } = useQuery({
    queryKey: ["userPresets"],
    queryFn: async () => {
      console.log("Fetching user presets...");
      const response = await fetch("/api/presets/uploaded");
      if (!response.ok) {
        console.error("Failed to fetch presets:", await response.text());
        throw new Error("Failed to fetch presets");
      }
      const data = await response.json();
      console.log("Fetched presets:", data);
      return data;
    },
  });

  // Add this after the query
  console.log("Query state:", { userPresets, isLoadingPresets, error });

  const presetOptions = useMemo(() => {
    console.log("Creating preset options from:", userPresets);
    return (
      userPresets?.map((preset: any) => ({
        value: preset.id,
        label: preset.title,
        price: preset.price,
      })) || []
    );
  }, [userPresets]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PresetPackFormData>({
    resolver: zodResolver(presetPackSchema),
    defaultValues: useMemo(
      () => ({
        title: initialData?.title || "",
        description: initialData?.description || "",
        price: initialData?.price || 5,
        presetIds: initialData?.presets?.map((p: any) => p.preset.id) || [],
      }),
      [initialData]
    ),
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        price: initialData.price,
        presetIds: initialData.presets?.map((p: any) => p.preset.id) || [],
      });
    }
  }, [initialData, reset]);

  // Create Pack mutation
  const createPackMutation = useMutation({
    mutationFn: async (data: PresetPackFormData) => {
      const response = await fetch("/api/presetPacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create preset pack");
      return response.json();
    },
  });

  // Update Pack mutation
  const updatePackMutation = useMutation({
    mutationFn: async (data: PresetPackFormData) => {
      const response = await fetch(`/api/presetPacks/${packId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update preset pack");
      return response.json();
    },
  });

  // Combined mutation for better handling
  const mutation = packId ? updatePackMutation : createPackMutation;

  // Update onSubmit to use the appropriate mutation
  const onSubmit = (data: PresetPackFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["presetPacks"] });
        if (packId) {
          queryClient.invalidateQueries({ queryKey: ["presetPack", packId] });
        }
        toast.success(
          `Preset pack ${packId ? "updated" : "created"} successfully`
        );
        router.push("/dashboard/packs");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      },
    });
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filter presets based on search term
  const filteredPresets = useMemo(() => {
    if (!userPresets) return [];
    return userPresets.filter((preset: any) =>
      preset.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userPresets, searchTerm]);

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

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label>Select Your Presets</Label>
          <span className="text-sm text-muted-foreground">
            Select 5 presets to include in your pack
          </span>
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search presets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Preset selection area */}
        <ScrollArea className="h-[300px] border rounded-md p-4">
          <div className="space-y-2">
            {isLoadingPresets ? (
              <div className="text-center text-muted-foreground">
                Loading presets...
              </div>
            ) : filteredPresets.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {searchTerm ? "No presets found" : "No presets available"}
              </div>
            ) : (
              filteredPresets.map((preset: any) => (
                <div
                  key={preset.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      selectedPresets.some((p) => p.id === preset.id)
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-accent"
                    }
                  `}
                  onClick={() => {
                    const isSelected = selectedPresets.some(
                      (p) => p.id === preset.id
                    );
                    if (isSelected) {
                      setSelectedPresets(
                        selectedPresets.filter((p) => p.id !== preset.id)
                      );
                    } else {
                      setSelectedPresets([
                        ...selectedPresets,
                        {
                          id: preset.id,
                          price: preset.price,
                          title: preset.title,
                        },
                      ]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{preset.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {preset.presetType} • ${preset.price}
                      </div>
                    </div>
                    <div className="text-sm">
                      {selectedPresets.some((p) => p.id === preset.id) ? (
                        <Badge variant="secondary">Got em</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Selected count and total value */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            {selectedPresets.length} preset
            {selectedPresets.length !== 1 ? "s" : ""} selected
          </div>
          <div>Total value: ${totalPresetsPrice}</div>
        </div>

        {errors.presetIds && (
          <p className="text-sm text-red-500">{errors.presetIds.message}</p>
        )}
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? "Saving..."
          : packId
          ? "Update Pack"
          : "Create Pack"}
      </Button>
    </form>
  );
}

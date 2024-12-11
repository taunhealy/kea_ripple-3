"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { PresetUpload, PriceType, VST, ItemType } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";
import { ItemActionButtons } from "./ItemActionButtons";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { Button } from "./ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

import { useEffect } from "react";
import { useItemActions } from "@/app/hooks/useItemActions";
import { getYouTubeThumbnail } from "@/utils/youtube";
import { Badge } from "./ui/badge";

interface PresetCardProps {
  preset: PresetUpload & {
    vst?: VST | null;
    user?: { username: string } | null;
    genre?: { name: string } | null;
    isOwner?: boolean;
    isDownloaded?: boolean;
  };
  contentViewMode: ContentViewMode;
  variant?: "default" | "compact";
}

export function PresetCard({
  preset,
  variant,
  contentViewMode,
}: PresetCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPlaying, activeTrack, audioElement, play, pause, cleanup } =
    useAudioPlayer({
      onError: (error) => {
        console.error("Audio playback error:", error);
        toast.error("Failed to play audio");
      },
    });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const { data: audio } = useQuery({
    queryKey: ["audio", preset.id],
    queryFn: async () => {
      if (!preset.soundPreviewUrl) return null;
      const audio = new Audio(preset.soundPreviewUrl);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        audio.addEventListener("canplaythrough", resolve, { once: true });
        audio.load();
      });
      return audio;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!preset.soundPreviewUrl,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/presets/${preset.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete response:", {
          status: response.status,
          data,
        });
        throw new Error(data.error || "Failed to delete preset");
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Delete success:", data);
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      toast.success("Preset deleted successfully");
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete preset"
      );
    },
  });

  console.log("Preset data:", preset);
  console.log("VST data:", preset.vst);
  if (!preset) return null;

  const displayPrice =
    preset.priceType === PriceType.FREE ? "Free" : `$${preset.price}`;

  const { handleDelete, handleEdit } = useItemActions({
    itemId: preset.id,
    itemType: ItemType.PRESET,
    contentViewMode,
  });

  const thumbnailUrl = preset.referenceTrackUrl
    ? getYouTubeThumbnail(preset.referenceTrackUrl)
    : null;

  const isOwner = contentViewMode === ContentViewMode.UPLOADED;
  const isDownloaded = contentViewMode === ContentViewMode.DOWNLOADED;

  return (
    <Card className="w-full flex flex-row gap-4 p-4 relative">
      <div className="absolute top-4 right-4 bg-muted px-3 py-1.5 rounded-md">
        <span className="text-sm font-medium">
          {preset.priceType === PriceType.FREE ? "Free" : `$${preset.price}`}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <CardTitle>{preset.title}</CardTitle>
          <CardDescription>
            By {preset.user?.username || "Anonymous"}
          </CardDescription>
        </div>

        <div className="space-y-2">
          <p>{preset.description}</p>
          <div className="flex gap-2">
            <Badge>{preset.genre?.name}</Badge>
            <Badge>{preset.presetType.toString()}</Badge>
            <Badge>{preset.vst?.name}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <ItemActionButtons
            itemId={preset.id}
            itemType={ItemType.PRESET}
            isOwner={isOwner}
            isDownloaded={isOwner || isDownloaded}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      </div>

      {thumbnailUrl && (
        <div className="w-[240px] aspect-video relative rounded-lg overflow-hidden">
          <img
            src={thumbnailUrl}
            alt="Reference track thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              const fallbackUrl = getYouTubeThumbnail(
                preset.referenceTrackUrl,
                "mq"
              );
              if (fallbackUrl) {
                (e.target as HTMLImageElement).src = fallbackUrl;
              }
            }}
          />
        </div>
      )}
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ItemActionButtons } from "./ItemActionButtons";
import Link from "next/link";
import { PriceChangeDisplay } from "@/app/components/PriceChangeDisplay";
import {
  PackageIcon,
  Edit2Icon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/app/store/features/cartSlice";
import { ContentViewMode } from "@/types/enums";
import { useItemActions } from "@/app/hooks/useItemActions";
import { ItemType, CartType } from "@prisma/client";
import { useAppDispatch } from "@/app/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface PresetPackCardProps {
  pack: {
    id: string;
    title: string;
    description?: string;
    price: number;
    presets: {
      preset: {
        id: string;
        title: string;
        price: number;
        soundPreviewUrl?: string;
      };
    }[];
    soundDesigner?: {
      username: string;
      profileImage?: string;
    };
  };
  contentViewMode: ContentViewMode;
}

export function PresetPackCard({ pack, contentViewMode }: PresetPackCardProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const totalPresetsPrice = pack.presets.reduce(
    (sum, item) => sum + item.preset.price,
    0
  );
  const savings = totalPresetsPrice - pack.price;
  const savingsPercentage = Math.round((savings / totalPresetsPrice) * 100);

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
      setActivePreset(null);
    }
  }, [audio]);

  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  const togglePlay = useCallback(
    (presetId: string, soundPreviewUrl?: string) => {
      if (!soundPreviewUrl) {
        toast.info("No preview available for this preset");
        return;
      }

      if (activePreset && activePreset !== presetId) {
        cleanupAudio();
      }

      if (!audio || activePreset !== presetId) {
        const newAudio = new Audio(soundPreviewUrl);
        newAudio.addEventListener("ended", () => {
          setIsPlaying(false);
          setActivePreset(null);
        });
        newAudio.addEventListener("error", () => {
          toast.error("Failed to load audio");
          cleanupAudio();
        });
        setAudio(newAudio);
        setActivePreset(presetId);
        newAudio.play().catch(() => {
          toast.error("Failed to play audio");
          cleanupAudio();
        });
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().catch(() => {
            toast.error("Failed to play audio");
            cleanupAudio();
          });
          setIsPlaying(true);
        }
      }
    },
    [audio, isPlaying, cleanupAudio, activePreset]
  );

  const { isDeleting, handleDelete, handleEdit } = useItemActions({
    itemId: pack.id,
    itemType: ItemType.PACK,
    contentViewMode: contentViewMode as ContentViewMode,
  });

  const handleAddToCart = async () => {
    try {
      dispatch(
        addToCart({
          itemId: pack.id,
          cartType: CartType.CART,
          itemType: ItemType.PACK,
        })
      );
      toast.success("Pack added to cart");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add pack to cart");
      }
    }
  };

  const displayedPresets = pack.presets || [];

  const isOwner = contentViewMode === ContentViewMode.UPLOADED;
  const isDownloaded = contentViewMode === ContentViewMode.DOWNLOADED;

  return (
    <Card className="relative group overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-0">
      <div className="absolute top-2 right-2 z-10">
        <ItemActionButtons
          itemId={pack.id}
          itemType={ItemType.PACK}
          isOwner={isOwner}
          isDownloaded={isOwner || isDownloaded}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isDeleting={isDeleting}
        />
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{pack.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${pack.price}</span>
            <span className="text-lg line-through text-muted-foreground">
              ${totalPresetsPrice}
            </span>
          </div>
          <div className="text-sm text-green-600">
            Save {savingsPercentage}% (${savings.toFixed(2)})
          </div>
        </div>

        {pack.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {pack.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {pack.presets?.length || 0} Presets Included
            </span>
          </div>
          {pack.soundDesigner && (
            <p className="text-sm text-muted-foreground">
              By: {pack.soundDesigner.username}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {displayedPresets.map((item) => (
            <div
              key={item.preset.id}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span className="text-sm truncate flex-1">
                {item.preset.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() =>
                  togglePlay(item.preset.id, item.preset.soundPreviewUrl)
                }
                disabled={!item.preset.soundPreviewUrl}
              >
                {isPlaying && activePreset === item.preset.id ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2">
          <Link href={`/packs/${pack.id}`} className="w-full">
            <Button className="w-full" variant="default">
              View Details
            </Button>
          </Link>
          <Button className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function useItemStatus(itemId: string, itemType: ItemType) {
  const { data: session } = useSession();

  const { data: downloads } = useQuery({
    queryKey: ["downloads", itemType],
    queryFn: async () => {
      const response = await fetch(`/api/${itemType}s?userStatus=DOWNLOADED`);
      if (!response.ok) throw new Error("Failed to fetch downloads");
      return response.json();
    },
    enabled: !!session?.user,
  });

  const isDownloaded = downloads?.some((item: any) => item.id === itemId);
  const isOwner =
    session?.user?.id ===
    downloads?.find((item: any) => item.id === itemId)?.userId;

  return {
    isOwner,
    isDownloaded,
  };
}

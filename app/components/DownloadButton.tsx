import { PriceType } from "@prisma/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface DownloadButtonProps {
  itemId: string;
  itemType: "preset" | "pack";
  priceType: PriceType;
  price?: number | null;
}

export function DownloadButton({
  itemId,
  itemType,
  priceType,
  price,
}: DownloadButtonProps) {
  const queryClient = useQueryClient();

  // Query to check if item is already downloaded
  const { data: downloads } = useQuery({
    queryKey: ["downloads", itemType],
    queryFn: async () => {
      const response = await fetch(`/api/${itemType}s?userStatus=DOWNLOADED`);
      if (!response.ok) throw new Error("Failed to fetch downloads");
      return response.json();
    },
  });

  const handleDownload = async () => {
    try {
      // Check if item is already downloaded
      const isDownloaded = downloads?.some((item: any) => item.id === itemId);

      if (isDownloaded) {
        toast.error(`This ${itemType} is already in your downloads`);
        return;
      }

      const endpoint =
        itemType === "preset" ? "/api/downloads/preset" : "/api/downloads/pack";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      if (!response.ok) throw new Error("Download failed");

      await queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Download successful");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant={priceType === "FREE" ? "default" : "secondary"}
    >
      {priceType === "FREE" ? "Download Free" : `Buy for $${price}`}
    </Button>
  );
}

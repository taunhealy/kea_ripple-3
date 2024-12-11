import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { ItemType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

interface DownloadButtonProps {
  itemId: string;
  itemType: ItemType;
}

export function DownloadButton({ itemId, itemType }: DownloadButtonProps) {
  const { mutate: fetchDownload, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/downloads/${itemType.toLowerCase()}/${itemId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get download URL");
      }
      const data = await response.json();
      return data;
    },
    onSuccess: async (data) => {
      try {
        console.log("Processing download for type:", itemType);
        console.log("ItemType enum value:", ItemType.PRESET);
        console.log("Received itemType:", itemType);
        if (itemType.toUpperCase() === ItemType.PRESET) {
          await downloadPreset(data);
        } else if (itemType.toUpperCase() === ItemType.PACK) {
          await downloadPack(data);
        } else {
          throw new Error(`Unsupported item type: ${itemType}`);
        }
      } catch (error) {
        console.error("Error in onSuccess:", error);
        toast.error(error instanceof Error ? error.message : "Download failed");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error instanceof Error ? error.message : "Download failed");
    },
  });

  // 📄 Single preset download - Creates a direct download link for one preset file
  const downloadPreset = async (data: {
    downloadUrl: string;
    filename?: string;
  }) => {
    if (!data.downloadUrl) throw new Error("No download URL available");

    const link = document.createElement("a");
    link.href = data.downloadUrl;
    link.download = data.filename || `preset-${itemId}.preset`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Preset download started");
  };

  // 📦 Pack download - Creates a ZIP file containing multiple presets
  const downloadPack = async (data: {
    presets: Array<{ url: string; title: string }>;
    packTitle?: string;
  }) => {
    if (!Array.isArray(data.presets)) throw new Error("Invalid pack data");

    toast.loading("Preparing pack download...");
    const zip = new JSZip();

    // 🔄 Fetch and add each preset to the ZIP file
    for (const preset of data.presets) {
      const presetResponse = await fetch(preset.url);
      const presetBlob = await presetResponse.blob();
      zip.file(`${preset.title}.preset`, presetBlob);
    }

    // 💾 Generate and trigger ZIP file download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `${data.packTitle || `pack-${itemId}`}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
    toast.success("Pack download started");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => fetchDownload()}
      title={`Download ${itemType}`}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}

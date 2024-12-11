import type { PresetUpload } from "@prisma/client";
import type { PresetWithRelations, WishlistItem } from "./interfaces";

export function transformPresetToWishlistItem(
  preset: PresetWithRelations
): WishlistItem {
  return {
    id: preset.id,
    presetId: preset.id,
    name: preset.title,
    price: preset.price ?? 0,
    imageString: preset.soundPreviewUrl ?? "",
    quantity: 1,
    creator: preset.soundDesigner?.username ?? "Unknown",
  };
}

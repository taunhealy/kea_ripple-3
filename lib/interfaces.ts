import { PresetUpload } from "@prisma/client";



export type PresetWithRelations = {
  id: string;
  title: string;
  price: number | null;
  soundPreviewUrl: string | null;
  soundDesigner?: {
    username: string | null;
  } | null;
};

export interface PresetPack {
  id: string;
  title: string;
  description?: string;
  price?: number;
  soundPreviewUrl?: string;
  presets: PresetUpload[];
  soundDesigner?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  tags?: string[];
}

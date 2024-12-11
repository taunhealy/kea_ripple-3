import { RequestStatus, RequestViewMode } from "@/types/enums";

// Base type from Prisma
export type PresetRequestBase = {
  id: string;
  title: string;
  youtubeLink: string | null;
  enquiryDetails: string;
  status: RequestStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  genreId: string | null;
};

// Extended type with relations
export type PresetRequestWithRelations = PresetRequestBase & {
  genre?: {
    id: string;
    name: string;
  };
  soundDesigner?: {
    id: string;
    username: string;
  };
  submissions?: RequestSubmission[];
};

// Type for the card component
export interface PresetRequestCardProps {
  request: PresetRequestWithRelations;
  showSubmissions?: boolean;
  currentUserId?: string;
  requestViewMode: RequestViewMode;
}

// Type for submissions
export interface RequestSubmission {
  id: string;
  title: string;
  guide?: string;
  soundPreviewUrl?: string;
  presetFileUrl?: string;
  userId: string;
  username: string;
  timestamp: string;
  genreId?: string;
  genre?: {
    id: string;
    name: string;
  };
  vstId?: string;
  vst?: {
    id: string;
    name: string;
  };
  presetType?: string;
}

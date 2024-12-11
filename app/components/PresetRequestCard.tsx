"use client";

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  EditIcon,
  DownloadIcon,
  PlayIcon,
  PauseIcon,
  YoutubeIcon,
  MusicIcon,
  TrashIcon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  RequestSubmission,
  PresetRequestCardProps,
} from "@/types/PresetRequestTypes";
import { AudioPlayer } from "@/app/components/AudioPlayer";
import { SubmitPresetButton } from "@/app/components/SubmitPresetButton";
import { useItemActions } from "@/app/hooks/useItemActions";
import { ItemActionButtons } from "@/app/components/ItemActionButtons";
import { getYouTubeThumbnail } from "@/utils/youtube";
import { ItemType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";

interface ViewModeContextType {
  contentViewMode?: ContentViewMode;
  requestViewMode?: RequestViewMode;
  itemType: ItemType;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined
);

export function ViewModeProvider({
  children,
  contentViewMode,
  requestViewMode,
  itemType,
}: ViewModeContextType & { children: ReactNode }) {
  return (
    <ViewModeContext.Provider
      value={{ contentViewMode, requestViewMode, itemType }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function usePresetRequestViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error(
      "usePresetRequestViewMode must be used within a ViewModeProvider"
    );
  }
  return context;
}

export function PresetRequestCard({
  request,
  showSubmissions = false,
  currentUserId,
}: PresetRequestCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [activeSubmission, setActiveSubmission] =
    useState<RequestSubmission | null>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { requestViewMode: viewMode } = usePresetRequestViewMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
      setActiveSubmission(null);
    }
  }, [audio]);

  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  const togglePlay = useCallback(
    (submission: RequestSubmission) => (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!submission.soundPreviewUrl) {
        toast.error("No sound preview available");
        return;
      }

      if (activeSubmission && activeSubmission.id !== submission.id) {
        cleanupAudio();
      }

      if (!audio || activeSubmission?.id !== submission.id) {
        const newAudio = new Audio(submission.soundPreviewUrl);
        newAudio.addEventListener("ended", () => setIsPlaying(false));
        newAudio.addEventListener("error", () => {
          toast.error("Failed to load audio");
          cleanupAudio();
        });
        setAudio(newAudio);
        setActiveSubmission(submission);
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
    [audio, isPlaying, cleanupAudio, activeSubmission]
  );

  const {
    isDeleting: itemActionsIsDeleting,
    handleDelete,
    handleEdit,
  } = useItemActions({
    itemId: request.id,
    itemType: ItemType.REQUEST,
    requestViewMode: viewMode as RequestViewMode,
  });

  console.log("PresetRequest Data:", {
    request,
    genre: request.genre,
    genreId: request.genreId,
  });

  // Show edit/delete buttons if user owns the request
  const showActions = currentUserId === request.userId;

  if (!mounted) {
    return null;
  }

  return (
    <Card onClick={(e) => e.preventDefault()}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <Badge>{request.status}</Badge>
          {showActions && (
            <ItemActionButtons
              itemId={request.id}
              itemType={ItemType.REQUEST}
              requestViewMode={viewMode as RequestViewMode}
              isDeleting={itemActionsIsDeleting}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
        <div>
          <CardTitle className="text-2xl">{request.title}</CardTitle>
          <CardDescription>
            Posted by {request.soundDesigner?.username || "Anonymous"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <Badge variant="outline">
              <MusicIcon className="h-3 w-3 mr-1" />
              {request.genre?.name || "No Genre"}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Enquiry Details:</h3>
            <p className="text-muted-foreground">{request.enquiryDetails}</p>
          </div>

          {currentUserId &&
            currentUserId !== request.userId &&
            (!request.submissions?.length || !showSubmissions) && (
              <div className="mt-4">
                <SubmitPresetButton requestId={request.id} />
              </div>
            )}

          <div className="space-y-2">
            <h4 className="font-medium">
              {request.submissions?.length
                ? `Submissions (${request.submissions.length})`
                : "Submissions"}
            </h4>
            {!request.submissions || request.submissions.length === 0 ? (
              <div className="text-muted-foreground">
                No submissions to display.
              </div>
            ) : (
              <div className="space-y-2">
                {request.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-2 bg-accent/20 rounded-md"
                  >
                    <span>{submission.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        by {submission.username}
                      </span>
                      {submission.soundPreviewUrl && (
                        <AudioPlayer
                          trackId={submission.id}
                          url={submission.soundPreviewUrl}
                          onError={(error) => {
                            console.error("Audio playback error:", error);
                          }}
                        />
                      )}
                      {submission.presetFileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(submission.presetFileUrl, "_blank")
                          }
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {request.youtubeLink && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <YoutubeIcon className="h-4 w-4" />
                Reference Track:
              </h3>
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (request.youtubeLink) {
                      window.open(request.youtubeLink, "_blank");
                    }
                  }}
                  className="relative aspect-video w-full overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                >
                  <img
                    src={
                      getYouTubeThumbnail(request.youtubeLink) ||
                      getYouTubeThumbnail(request.youtubeLink, "mq")
                    }
                    alt="YouTube thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        getYouTubeThumbnail(request.youtubeLink, "mq") || "";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <YoutubeIcon className="h-12 w-12 text-white/90" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

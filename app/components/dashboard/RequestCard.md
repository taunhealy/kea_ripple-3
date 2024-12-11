"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { EditIcon, PlayIcon, PauseIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface RequestSubmission {
  id: string;
  userId: string;
  username: string;
  title: string;
  soundPreviewUrl?: string;
  presetFileUrl?: string;
  guide?: string;
  timestamp: string;
}

interface RequestCardProps {
  request: {
    id: string;
    userId: string;
    title: string;
    youtubeLink: string;
    timestamp: string;
    genre: string;
    status: "OPEN" | "ASSISTED" | "SATISFIED";
    soundDesigner: {
      username: string;
    };
    submissions?: RequestSubmission[];
  };
  type: "requested" | "assisted";
}

export function RequestCard({ request, type }: RequestCardProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [activeSubmission, setActiveSubmission] =
    useState<RequestSubmission | null>(null);

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

      // If playing a different submission, cleanup previous audio
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking interactive elements
    if ((e.target as HTMLElement).closest(".interactive-element")) {
      e.stopPropagation();
      return;
    }
    router.push(`/presetRequest/${request.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>
            Posted by {request.soundDesigner?.username || "Anonymous"}
          </CardDescription>
        </div>
        <Link
          href={`/dashboard/presetRequest/${request.id}/edit`}
          className="interactive-element"
        >
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Status: {request.status}</span>
            <span>Genre: {request.genre}</span>
          </div>

          {request.submissions && request.submissions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Submissions</h4>
              {request.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-2 bg-accent/20 rounded-md interactive-element"
                >
                  <span>{submission.title}</span>
                  {submission.soundPreviewUrl && (
                    <Button
                      onClick={togglePlay(submission)}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    >
                      {isPlaying && activeSubmission?.id === submission.id ? (
                        <PauseIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <PlayIcon className="h-4 w-4 mr-2" />
                      )}
                      {isPlaying && activeSubmission?.id === submission.id
                        ? "Pause"
                        : "Play"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";

interface Preset {
  id: string;
  soundPreviewUrl?: string;
  title: string;
  description: string;
  presetFileUrl?: string;
  isFree: boolean;
  price?: number;
  genre?: { name: string };
  vst?: { name: string };
  presetType: string;
  spotifyLink?: string;
}

export default function PresetPage({ params }: { params: { id: string } }) {
  // Fetch preset data using React Query
  const { data: preset, isLoading, error } = useQuery<Preset>({
    queryKey: ['preset', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presets/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch preset');
      }
      return response.json();
    }
  });

  const audioOptions = {
    onError: (error: Error) => {
      console.error('Audio playback error:', error);
    }
  };

  const { isPlaying, activeTrack, play, pause } = useAudioPlayer(audioOptions);

  const handlePlayClick = () => {
    if (!preset?.soundPreviewUrl) return;

    if (isPlaying && activeTrack === preset.id) {
      pause();
    } else {
      play(preset.id, preset.soundPreviewUrl);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : 'Failed to load preset'}</div>;
  if (!preset) return <div>Preset not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{preset.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <Button onClick={handlePlayClick} variant="outline" size="lg">
            {isPlaying && activeTrack === preset.id ? (
              <PauseIcon className="mr-2 h-4 w-4" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {isPlaying && activeTrack === preset.id ? "Pause" : "Play Preview"}
          </Button>

          {preset.presetFileUrl && (
            <Button size="lg">
              {preset.isFree ? "Download Free" : `Buy for $${preset.price}`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{preset.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <dl className="grid grid-cols-2 gap-2">
              <dt className="text-gray-600">Genre:</dt>
              <dd>{preset.genre?.name}</dd>
              <dt className="text-gray-600">VST:</dt>
              <dd>{preset.vst?.name}</dd>
              <dt className="text-gray-600">Type:</dt>
              <dd>{preset.presetType}</dd>
              {preset.spotifyLink && (
                <>
                  <dt className="text-gray-600">Reference:</dt>
                  <dd>
                    <a
                      href={preset.spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Listen on Spotify
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

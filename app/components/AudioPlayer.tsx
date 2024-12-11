// app/components/AudioPlayer.tsx
"use client";

import { Button } from "./ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { useEffect } from "react";

interface AudioPlayerProps {
  trackId: string;
  url: string;
  preloadedAudio?: HTMLAudioElement;
  onError?: (error: Error) => void;
}

export function AudioPlayer({
  trackId,
  url,
  preloadedAudio,
  onError,
}: AudioPlayerProps) {
  const { isPlaying, audioElement, play, pause } = useAudioPlayer({ onError });

  useEffect(() => {
    if (preloadedAudio) {
      play(trackId, url, preloadedAudio);
    }
  }, [preloadedAudio, trackId, url]);

  const handleClick = () => {
    isPlaying ? pause() : play(trackId, url);
  };

  return (
    <Button 
      onClick={handleClick} 
      variant="ghost" 
      size="sm" 
      className="w-full relative overflow-hidden"
    >
      <div className="flex items-center justify-center w-full">
        {isPlaying ? (
          <div className="absolute inset-0 flex items-center">
            <WaveformVisualizer
              audioElement={audioElement}
              isPlaying={isPlaying}
              amplitudeMultiplier={1.5}
            />
          </div>
        ) : (
          <PlayIcon className="h-4 w-4 mr-2" />
        )}
        <span className="relative z-10 ml-2">
          {isPlaying ? "Pause" : "Play"}
        </span>
      </div>
    </Button>
  );
}

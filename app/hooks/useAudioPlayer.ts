import { useCallback, useState } from "react";
import { audioContextManager } from "@/utils/audioContext";
import { useQueryClient } from "@tanstack/react-query";

export function useAudioPlayer({
  onError,
}: {
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isWaveformReady, setIsWaveformReady] = useState(false);

  const cleanupAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.removeEventListener("ended", () => {
        setIsPlaying(false);
        setActiveTrack(null);
      });
      setAudioElement(null);
      setIsPlaying(false);
      setActiveTrack(null);
      setIsWaveformReady(false);
    }
  }, [audioElement]);

  const play = async (
    trackId: string,
    url: string,
    preloadedAudio?: HTMLAudioElement
  ) => {
    try {
      if (isPlaying && activeTrack === trackId) {
        return;
      }

      cleanupAudio();

      let audio = preloadedAudio;
      if (!audio) {
        const cachedAudio = await queryClient.fetchQuery({
          queryKey: ["audio", trackId],
          queryFn: async () => {
            const newAudio = new Audio(url);
            newAudio.crossOrigin = "anonymous";
            await newAudio.load();
            return newAudio;
          },
          staleTime: 1000 * 60 * 5,
        });
        audio = cachedAudio;
      }

      setAudioElement(audio);
      setActiveTrack(trackId);

      const analyser = audioContextManager.setupAudioNode(audio);
      setIsWaveformReady(true);

      const handleEnded = () => {
        setIsPlaying(false);
        setActiveTrack(null);
      };

      audio.addEventListener("ended", handleEnded);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      onError?.(error as Error);
    }
  };

  const pause = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    activeTrack,
    audioElement,
    isWaveformReady,
    play,
    pause,
    cleanup: cleanupAudio,
  };
}

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { PresetUpload } from "@prisma/client";

async function preloadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = (e) => reject(e);

    audio.src = url;
    audio.load();
  });
}

export function useAudioPreloader(presets: PresetUpload[] = []) {
  const queryClient = useQueryClient();

  const audioQueries = useQueries({
    queries: (presets || [])
      .filter((preset): preset is PresetUpload & { soundPreviewUrl: string } =>
        Boolean(preset?.soundPreviewUrl)
      )
      .map((preset) => ({
        queryKey: ["audio", preset.id],
        queryFn: () => preloadAudio(preset.soundPreviewUrl),
        staleTime: Infinity,
        cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
        enabled: true,
      })),
  });

  return {
    getAudio: (presetId: string) =>
      queryClient.getQueryData<HTMLAudioElement>(["audio", presetId]),
  };
}

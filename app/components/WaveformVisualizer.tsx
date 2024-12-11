import { useRef, useCallback, useEffect } from "react";
import { audioContextManager } from "@/utils/audioContext";

interface WaveformVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  amplitudeMultiplier?: number;
}

export function WaveformVisualizer({
  audioElement,
  isPlaying,
  amplitudeMultiplier = 1.5,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();

  // Setup audio context and analyser node
  useEffect(() => {
    if (!audioElement) return;

    try {
      analyserRef.current = audioContextManager.setupAudioNode(audioElement);
      if (analyserRef.current) {
        analyserRef.current.fftSize = 2048;
      }
    } catch (error) {
      console.error("Error setting up audio context:", error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElement]);

  // Handle visualization drawing
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !isPlaying) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight =
          (dataArray[i] / 255) * canvas.height * amplitudeMultiplier;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#2563eb33");
        gradient.addColorStop(1, "#2563eb");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, amplitudeMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-8 bg-transparent"
      width={300}
      height={32}
    />
  );
}

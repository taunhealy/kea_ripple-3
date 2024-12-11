export default class AudioContextManager {
  private static instance: AudioContextManager | null = null;
  private audioContext: AudioContext | null = null;

  private constructor() {
    this.audioContext = null;
  }

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  setupAudioNode(audioElement: HTMLAudioElement): AnalyserNode {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const source = this.audioContext.createMediaElementSource(audioElement);
    const analyser = this.audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(this.audioContext.destination);
    
    return analyser;
  }
}

export const audioContextManager = AudioContextManager.getInstance();

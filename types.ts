export enum TranslationStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface LanguageConfig {
  id: string;
  name: string;
  fontClass: string; // e.g., 'font-chinese'
}

export interface TranslationData {
  lang1Text: string;
  lang2Text: string;
  timestamp: number;
}

export interface AppConfig {
  lang1: string;
  lang2: string;
}

// For the visualizer
export interface VisualizerProps {
  isRecording: boolean;
  audioContext?: AudioContext;
  sourceNode?: MediaStreamAudioSourceNode;
}
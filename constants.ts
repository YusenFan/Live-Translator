import { LanguageConfig } from './types';

export const DEFAULT_CONFIG = {
  lang1: 'Simplified Chinese',
  lang2: 'Bengali'
};

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const SAMPLE_RATE = 16000;

export const AVAILABLE_LANGUAGES: LanguageConfig[] = [
  { id: 'Simplified Chinese', name: 'Simplified Chinese', fontClass: 'font-chinese' },
  { id: 'Bengali', name: 'Bengali', fontClass: 'font-bengali' },
  { id: 'English', name: 'English', fontClass: 'font-sans' },
  { id: 'Spanish', name: 'Spanish', fontClass: 'font-sans' },
  { id: 'Japanese', name: 'Japanese', fontClass: 'font-sans' },
  { id: 'Korean', name: 'Korean', fontClass: 'font-sans' },
  { id: 'French', name: 'French', fontClass: 'font-sans' },
  { id: 'German', name: 'German', fontClass: 'font-sans' },
  { id: 'Hindi', name: 'Hindi', fontClass: 'font-sans' },
  { id: 'Arabic', name: 'Arabic', fontClass: 'font-sans' },
];
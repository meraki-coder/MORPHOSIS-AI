import { AnimationStyle, VideoResolution, VideoFormat } from './types';

export const ANIMATION_STYLES: AnimationStyle[] = [
  'Realistic',
  'Cinematic',
  'Stylized',
  'Cartoon',
  'Sketch'
];

export const VIDEO_RESOLUTIONS: VideoResolution[] = ['720p', '1080p', '4k'];

export const VIDEO_FORMATS: VideoFormat[] = ['mp4', 'webm', 'avi'];

export const APP_THEME = {
  primary: '#4F46E5', // Indigo 600
  bg: '#0A0A0F',
  card: '#0F172A',
  border: '#1E293B',
  text: '#E2E8F0',
  textMuted: '#64748B'
};

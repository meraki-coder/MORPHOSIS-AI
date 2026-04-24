export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  sourceVideo?: string;
  referenceImage?: string;
  status: ProjectStatus;
  createdAt: number;
  options: {
    removeBackground: boolean;
    animationSpeed: number;
    animationStyle: string;
    resolution: string;
    format: string;
  };
  outputVideo?: string;
  progress?: number;
}

export type AnimationStyle = 'Realistic' | 'Cinematic' | 'Stylized' | 'Cartoon' | 'Sketch';
export type VideoResolution = '720p' | '1080p' | '4k';
export type VideoFormat = 'mp4' | 'webm' | 'avi';

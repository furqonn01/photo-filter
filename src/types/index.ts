export type FrameType =
  | 'none'
  | 'macbook'
  | 'iphone'
  | 'reels'
  | 'digicam'
  | 'photobooth_4cut'
  | 'polaroid'
  | 'gameboy'
  | 'music_player';

export type FilterType =
  | 'normal'
  | 'birds_hearts'
  | 'macbook_squeeze'
  | 'macbook_comic'
  | 'macbook_thermal'
  | 'macbook_popart'
  | 'y2k_flash'
  | 'vintage_35mm'
  | 'pastel_dream'
  | 'cyber_neon'
  | 'noir_bw'
  | 'vhs_glitch';

export interface StickerItem {
  id: string;
  type: 'emoji' | 'text' | 'badge';
  content: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  scale: number;
  rotation: number; // degrees
  color?: string;
  fontFamily?: string;
}

export interface PhotoAdjustments {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  warmth: number;     // -50 to 50 (default 0)
  grain: number;      // 0 to 100 (default 0)
  vignette: number;   // 0 to 100 (default 0)
  zoom: number;       // 0.5 to 3.0 (default 1)
  panX: number;       // offset in px
  panY: number;       // offset in px
  rotation: number;   // 0, 90, 180, 270 or continuous
  flipH: boolean;
  flipV: boolean;
}

export interface FrameSettings {
  // MacBook
  macbookTitle: string;
  macbookDark: boolean;

  // iPhone
  iphoneGrid: boolean;
  iphoneCameraMode: 'PHOTO' | 'PORTRAIT' | 'CINEMATIC' | 'PANO';
  iphoneZoomBadge: string;
  iphoneShowFocus: boolean;
  iphoneFrameScale: number; // 0.5 to 1.6 (default 1.0)

  // Reels
  reelsUsername: string;
  reelsCaption: string;
  reelsLikes: string;
  reelsComments: string;
  reelsAudio: string;

  // Digicam
  digicamDate: string;
  digicamBattery: number;
  digicamRec: boolean;

  // Photobooth 4-cut
  photoboothColor: string;
  photoboothText: string;
  photoboothDate: string;

  // Polaroid
  polaroidCaption: string;
  polaroidColor: string;

  // Music Player
  musicSongTitle: string;
  musicArtist: string;
  musicProgress: number; // 0 to 100
}

export type AspectRatio = '1:1' | '4:5' | '9:16' | '4:3' | 'original';


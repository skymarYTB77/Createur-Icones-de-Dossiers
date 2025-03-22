export interface FolderIcon {
  id?: string;
  userId: string;
  name: string;
  image: string;
  imageSettings: ImageSettings;
  overlayImage: OverlaySettings | null;
  overlayText: TextSettings | null;
  createdAt?: Date;
}

export interface ImageSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
}

export interface OverlaySettings {
  image: string;
  x: number;
  y: number;
  scale: number;
}

export interface TextSettings {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fontFamily: string;
}

export const defaultImageSettings: ImageSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0
};

export const defaultOverlaySettings: OverlaySettings = {
  image: '',
  x: 0,
  y: 0,
  scale: 100
};

export const defaultTextSettings: TextSettings = {
  text: '',
  x: 0,
  y: 0,
  size: 24,
  color: '#000000',
  fontFamily: 'Arial'
};
export interface FolderIcon {
  id?: string;
  userId: string;
  name: string;
  image: string;
  imageSettings: ImageSettings;
  createdAt?: Date;
}

export interface ImageSettings {
  scale: number;
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  hue: number;
  blur: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  rotation: number;
}

export const defaultImageSettings: ImageSettings = {
  scale: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 100,
  hue: 0,
  blur: 0,
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  rotation: 0
};
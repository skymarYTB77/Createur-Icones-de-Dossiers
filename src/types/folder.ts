export interface FolderIcon {
  id?: string;
  userId: string;
  name: string;
  image: string;
  imageSettings: ImageSettings;
  createdAt?: Date;
}

export interface ImageSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  color: string;
}

export interface FolderStyle {
  id: string;
  name: string;
  render: (ctx: CanvasRenderingContext2D, color: string, settings: ImageSettings) => void;
}

export const defaultImageSettings: ImageSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 100,
  color: '#4f46e5'
};
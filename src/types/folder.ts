export interface FolderStyle {
  id: string;
  name: string;
  render: (ctx: CanvasRenderingContext2D, color: string) => void;
}

export interface CustomFolderStyle extends FolderStyle {
  data: string; // SVG ou instructions de rendu personnalisées
}
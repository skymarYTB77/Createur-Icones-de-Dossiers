import { FolderStyle } from '../types/folder';

export const defaultFolderStyles: FolderStyle[] = [
  {
    id: 'classic',
    name: 'Classique',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(432, 160);
      ctx.quadraticCurveTo(452, 160, 452, 180);
      ctx.lineTo(452, 432);
      ctx.quadraticCurveTo(452, 452, 432, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(432, 80);
      ctx.quadraticCurveTo(452, 80, 452, 100);
      ctx.lineTo(452, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();
    }
  },
  {
    id: 'modern',
    name: 'Moderne',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      // Corps principal avec coins arrondis
      ctx.beginPath();
      ctx.roundRect(60, 120, 392, 332, 20);
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet moderne
      ctx.beginPath();
      ctx.moveTo(80, 120);
      ctx.lineTo(180, 80);
      ctx.quadraticCurveTo(200, 70, 220, 70);
      ctx.lineTo(432, 70);
      ctx.quadraticCurveTo(452, 70, 452, 90);
      ctx.lineTo(452, 120);
      ctx.lineTo(80, 120);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 90%, #fff)`;
      ctx.fill();
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      // Simple rectangle sans onglet
      ctx.beginPath();
      ctx.roundRect(60, 80, 392, 372, 12);
      ctx.fillStyle = color;
      ctx.fill();

      // Ligne décorative
      ctx.beginPath();
      ctx.moveTo(80, 120);
      ctx.lineTo(432, 120);
      ctx.strokeStyle = `color-mix(in srgb, ${color} 70%, #fff)`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  },
  {
    id: 'retro',
    name: 'Rétro',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      // Corps principal avec effet "profondeur"
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(432, 160);
      ctx.lineTo(452, 180);
      ctx.lineTo(452, 452);
      ctx.lineTo(80, 452);
      ctx.lineTo(60, 432);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Effet 3D
      ctx.beginPath();
      ctx.moveTo(432, 160);
      ctx.lineTo(452, 180);
      ctx.lineTo(452, 452);
      ctx.lineTo(432, 432);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 70%, #000)`;
      ctx.fill();

      // Onglet avec effet 3D
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(180, 100);
      ctx.lineTo(432, 100);
      ctx.lineTo(452, 120);
      ctx.lineTo(452, 180);
      ctx.lineTo(432, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 85%, #fff)`;
      ctx.fill();
    }
  }
];
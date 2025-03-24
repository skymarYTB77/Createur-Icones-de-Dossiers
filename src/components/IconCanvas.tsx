import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';
import debounce from 'lodash.debounce';
import WebFont from 'webfontloader';

interface IconCanvasProps {
  mainImage: string | null;
  imageSettings: ImageSettings;
  overlaySettings: OverlaySettings;
  textSettings: TextSettings;
  width?: number;
  height?: number;
  onDrag?: (type: 'text' | 'image', x: number, y: number) => void;
}

const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Source Sans Pro',
  'Ubuntu',
  'Playfair Display',
  'Merriweather'
];

export const IconCanvas = React.forwardRef<HTMLCanvasElement, IconCanvasProps>(({
  mainImage,
  imageSettings,
  overlaySettings,
  textSettings,
  width = 512,
  height = 512,
  onDrag
}, ref) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || localCanvasRef;
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'text' | 'image' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Charger les polices Google
  useEffect(() => {
    WebFont.load({
      google: {
        families: GOOGLE_FONTS
      }
    });
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mainImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner l'image principale
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      requestAnimationFrame(() => {
        // Appliquer les filtres
        ctx.filter = `
          brightness(${imageSettings.brightness}%)
          contrast(${imageSettings.contrast}%)
          saturate(${imageSettings.saturation}%)
          hue-rotate(${imageSettings.hue}deg)
        `;

        // Dessiner l'image principale centrée
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Réinitialiser les filtres
        ctx.filter = 'none';

        // Dessiner l'image superposée
        if (overlaySettings.image) {
          const overlayImg = new Image();
          overlayImg.crossOrigin = 'anonymous';
          overlayImg.onload = () => {
            requestAnimationFrame(() => {
              const overlayScale = overlaySettings.scale / 100;
              const centerX = width / 2 + overlaySettings.x;
              const centerY = height / 2 + overlaySettings.y;

              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.scale(overlayScale, overlayScale);
              ctx.drawImage(
                overlayImg,
                -overlayImg.width / 2,
                -overlayImg.height / 2
              );
              ctx.restore();

              // Dessiner le texte après l'image
              if (textSettings.text) {
                drawText(ctx);
              }
            });
          };
          overlayImg.src = overlaySettings.image;
        } else if (textSettings.text) {
          drawText(ctx);
        }
      });
    };
    img.src = mainImage;
  }, [mainImage, imageSettings, overlaySettings, textSettings, width, height]);

  // Debounce le rendu pour éviter les mises à jour trop fréquentes
  const debouncedDraw = useCallback(
    debounce(() => {
      requestAnimationFrame(drawCanvas);
    }, 16),
    [drawCanvas]
  );

  useEffect(() => {
    debouncedDraw();
    return () => {
      debouncedDraw.cancel();
    };
  }, [debouncedDraw]);

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.font = `${textSettings.size}px "${textSettings.fontFamily}"`;
    ctx.fillStyle = textSettings.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      textSettings.text,
      width / 2 + textSettings.x,
      height / 2 + textSettings.y
    );
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier si le clic est sur le texte ou l'image superposée
    const centerX = width / 2;
    const centerY = height / 2;

    if (textSettings.text) {
      const textX = centerX + textSettings.x;
      const textY = centerY + textSettings.y;
      const textWidth = textSettings.text.length * (textSettings.size / 2);
      const textHeight = textSettings.size;

      if (
        x >= textX - textWidth / 2 &&
        x <= textX + textWidth / 2 &&
        y >= textY - textHeight / 2 &&
        y <= textY + textHeight / 2
      ) {
        setIsDragging(true);
        setDragTarget('text');
        setDragOffset({
          x: textX - x,
          y: textY - y
        });
        return;
      }
    }

    if (overlaySettings.image) {
      const overlayX = centerX + overlaySettings.x;
      const overlayY = centerY + overlaySettings.y;
      const overlayScale = overlaySettings.scale / 100;
      const overlayWidth = 200 * overlayScale;
      const overlayHeight = 200 * overlayScale;

      if (
        x >= overlayX - overlayWidth / 2 &&
        x <= overlayX + overlayWidth / 2 &&
        y >= overlayY - overlayHeight / 2 &&
        y <= overlayY + overlayHeight / 2
      ) {
        setIsDragging(true);
        setDragTarget('image');
        setDragOffset({
          x: overlayX - x,
          y: overlayY - y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragTarget || !onDrag) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + dragOffset.x - width / 2;
    const y = e.clientY - rect.top + dragOffset.y - height / 2;

    onDrag(dragTarget, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full object-contain cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
});

IconCanvas.displayName = 'IconCanvas';
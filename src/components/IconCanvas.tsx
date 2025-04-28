import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';
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
  const mainImageRef = useRef<HTMLImageElement>();
  const overlayImageRef = useRef<HTMLImageElement>();
  const renderFrameRef = useRef<number>();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'text' | 'image' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

  // Charger les polices Google
  useEffect(() => {
    WebFont.load({
      google: {
        families: GOOGLE_FONTS
      }
    });
  }, []);

  // Précharger et mettre à jour les images
  useEffect(() => {
    if (mainImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        mainImageRef.current = img;
        drawCanvas();
      };
      img.src = mainImage;
    }

    if (overlaySettings.image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        overlayImageRef.current = img;
        drawCanvas();
      };
      img.src = overlaySettings.image;
    }

    return () => {
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current);
      }
    };
  }, [mainImage, overlaySettings.image]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mainImageRef.current) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner l'image principale
    const img = mainImageRef.current;
    const scale = Math.min(width / img.width, height / img.height);
    const x = (width - img.width * scale) / 2;
    const y = (height - img.height * scale) / 2;

    // Appliquer les filtres
    ctx.filter = `
      brightness(${imageSettings.brightness}%)
      contrast(${imageSettings.contrast}%)
      saturate(${imageSettings.saturation}%)
      hue-rotate(${imageSettings.hue}deg)
    `;

    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Réinitialiser les filtres
    ctx.filter = 'none';

    // Dessiner l'image superposée
    if (overlayImageRef.current && overlaySettings.image) {
      const overlayImg = overlayImageRef.current;
      const overlayScale = overlaySettings.scale / 100;
      const centerX = width / 2 + (isDragging && dragTarget === 'image' ? currentPosition.x : overlaySettings.x);
      const centerY = height / 2 + (isDragging && dragTarget === 'image' ? currentPosition.y : overlaySettings.y);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(overlayScale, overlayScale);
      
      if (isDragging && dragTarget === 'image') {
        ctx.shadowColor = 'rgba(0, 0, 255, 0.3)';
        ctx.shadowBlur = 10;
      }
      
      ctx.drawImage(
        overlayImg,
        -overlayImg.width / 2,
        -overlayImg.height / 2
      );
      ctx.restore();
    }

    // Dessiner le texte
    if (textSettings.text) {
      ctx.save();
      ctx.font = `${textSettings.size}px "${textSettings.fontFamily}"`;
      ctx.fillStyle = textSettings.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = width / 2 + (isDragging && dragTarget === 'text' ? currentPosition.x : textSettings.x);
      const textY = height / 2 + (isDragging && dragTarget === 'text' ? currentPosition.y : textSettings.y);

      if (isDragging && dragTarget === 'text') {
        ctx.shadowColor = 'rgba(0, 0, 255, 0.3)';
        ctx.shadowBlur = 10;
      }

      ctx.fillText(textSettings.text, textX, textY);
      ctx.restore();
    }
  }, [imageSettings, overlaySettings, textSettings, width, height, isDragging, dragTarget, currentPosition]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
        setCurrentPosition({
          x: textSettings.x,
          y: textSettings.y
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
        setCurrentPosition({
          x: overlaySettings.x,
          y: overlaySettings.y
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

    setCurrentPosition({ x, y });
    onDrag(dragTarget, x, y);
    
    if (renderFrameRef.current) {
      cancelAnimationFrame(renderFrameRef.current);
    }
    renderFrameRef.current = requestAnimationFrame(drawCanvas);
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
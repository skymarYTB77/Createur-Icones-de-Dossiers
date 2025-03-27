import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

export async function createIcoBlob(
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings
): Promise<Blob> {
  // Créer un tableau pour stocker les données de chaque taille d'icône
  const iconData: { width: number; height: number; data: Uint8Array }[] = [];
  
  // Pour chaque taille d'icône
  for (const size of ICON_SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) continue;

    // Charger et dessiner l'image principale
    const img = await loadImage(mainImage);
    
    // Appliquer les filtres
    ctx.filter = `
      brightness(${imageSettings.brightness}%)
      contrast(${imageSettings.contrast}%)
      saturate(${imageSettings.saturation}%)
      hue-rotate(${imageSettings.hue}deg)
    `;
    
    // Dessiner l'image principale redimensionnée
    ctx.drawImage(img, 0, 0, size, size);
    
    // Réinitialiser les filtres
    ctx.filter = 'none';
    
    // Ajouter l'image superposée si elle existe
    if (overlaySettings.image) {
      const overlayImg = await loadImage(overlaySettings.image);
      const scale = overlaySettings.scale / 100;
      const overlaySize = size * scale;
      const x = (size / 2) + (overlaySettings.x * (size / 512));
      const y = (size / 2) + (overlaySettings.y * (size / 512));
      
      ctx.drawImage(
        overlayImg,
        x - (overlaySize / 2),
        y - (overlaySize / 2),
        overlaySize,
        overlaySize
      );
    }
    
    // Ajouter le texte si nécessaire
    if (textSettings.text) {
      const fontSize = (textSettings.size * size) / 512;
      ctx.font = `${fontSize}px "${textSettings.fontFamily}"`;
      ctx.fillStyle = textSettings.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = (size / 2) + (textSettings.x * (size / 512));
      const y = (size / 2) + (textSettings.y * (size / 512));
      
      ctx.fillText(textSettings.text, x, y);
    }
    
    // Obtenir les données de l'image
    const imageData = ctx.getImageData(0, 0, size, size);
    const { data: bmpData, mask: maskData } = convertToBMP(imageData);
    
    iconData.push({
      width: size,
      height: size,
      data: new Uint8Array([...bmpData, ...maskData])
    });
  }

  // Créer l'en-tête ICO
  const header = new Uint8Array([
    0, 0,             // Reserved
    1, 0,             // ICO type
    iconData.length, 0 // Number of images
  ]);

  // Calculer les offsets
  let offset = 6 + (iconData.length * 16); // Header + Directory entries
  const directory = new Uint8Array(iconData.length * 16);
  const images = new Uint8Array(iconData.reduce((acc, img) => acc + img.data.length, 0));
  
  let imageOffset = 0;
  for (let i = 0; i < iconData.length; i++) {
    const img = iconData[i];
    const dirOffset = i * 16;
    
    directory[dirOffset] = img.width === 256 ? 0 : img.width;
    directory[dirOffset + 1] = img.height === 256 ? 0 : img.height;
    directory[dirOffset + 2] = 0; // Color palette size
    directory[dirOffset + 3] = 0; // Reserved
    directory[dirOffset + 4] = 1; // Color planes
    directory[dirOffset + 5] = 0;
    directory[dirOffset + 6] = 32; // Bits per pixel
    directory[dirOffset + 7] = 0;
    
    // Image size
    const size = img.data.length;
    directory[dirOffset + 8] = size & 0xFF;
    directory[dirOffset + 9] = (size >> 8) & 0xFF;
    directory[dirOffset + 10] = (size >> 16) & 0xFF;
    directory[dirOffset + 11] = (size >> 24) & 0xFF;
    
    // Image offset
    directory[dirOffset + 12] = offset & 0xFF;
    directory[dirOffset + 13] = (offset >> 8) & 0xFF;
    directory[dirOffset + 14] = (offset >> 16) & 0xFF;
    directory[dirOffset + 15] = (offset >> 24) & 0xFF;
    
    images.set(img.data, imageOffset);
    offset += size;
    imageOffset += img.data.length;
  }

  return new Blob([header, directory, images], { type: 'image/x-icon' });
}

function convertToBMP(imageData: ImageData): { data: Uint8Array; mask: Uint8Array } {
  const { width, height, data } = imageData;
  const stride = Math.ceil(width * 32 / 32) * 4;
  const maskStride = Math.ceil(width / 32) * 4;
  const bmpData = new Uint8Array(stride * height);
  const maskData = new Uint8Array(maskStride * height);

  // Convertir les données de l'image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const dstOffset = (height - 1 - y) * stride + x * 4;
      
      // BGRA format
      bmpData[dstOffset] = data[srcOffset + 2];     // B
      bmpData[dstOffset + 1] = data[srcOffset + 1]; // G
      bmpData[dstOffset + 2] = data[srcOffset];     // R
      bmpData[dstOffset + 3] = data[srcOffset + 3]; // A
      
      // Masque de transparence
      const maskOffset = (height - 1 - y) * maskStride + Math.floor(x / 8);
      const maskBit = 7 - (x % 8);
      if (data[srcOffset + 3] < 128) {
        maskData[maskOffset] |= (1 << maskBit);
      }
    }
  }

  return { data: bmpData, mask: maskData };
}

export async function createPNGBlob(
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Charger et dessiner l'image principale
  const img = await loadImage(mainImage);
  
  // Appliquer les filtres
  ctx.filter = `
    brightness(${imageSettings.brightness}%)
    contrast(${imageSettings.contrast}%)
    saturate(${imageSettings.saturation}%)
    hue-rotate(${imageSettings.hue}deg)
  `;
  
  // Dessiner l'image principale
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Réinitialiser les filtres
  ctx.filter = 'none';
  
  // Ajouter l'image superposée si elle existe
  if (overlaySettings.image) {
    const overlayImg = await loadImage(overlaySettings.image);
    const scale = overlaySettings.scale / 100;
    const overlaySize = canvas.width * scale;
    const x = (canvas.width / 2) + overlaySettings.x;
    const y = (canvas.height / 2) + overlaySettings.y;
    
    ctx.drawImage(
      overlayImg,
      x - (overlaySize / 2),
      y - (overlaySize / 2),
      overlaySize,
      overlaySize
    );
  }
  
  // Ajouter le texte si nécessaire
  if (textSettings.text) {
    ctx.font = `${textSettings.size}px "${textSettings.fontFamily}"`;
    ctx.fillStyle = textSettings.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const x = (canvas.width / 2) + textSettings.x;
    const y = (canvas.height / 2) + textSettings.y;
    
    ctx.fillText(textSettings.text, x, y);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
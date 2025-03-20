import React, { useState, useRef } from 'react';
import { Folder, Upload, Download, Palette, RefreshCw } from 'lucide-react';

function App() {
  const [folderColor, setFolderColor] = useState('#FFB900');
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [perspective, setPerspective] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOverlayImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToICO = (canvas: HTMLCanvasElement): Blob => {
    const sizes = [16, 32, 48, 64, 128, 256];
    
    const headerSize = 6;
    const directorySize = sizes.length * 16;
    const imageSizes = sizes.map(size => size * size * 4);
    const totalSize = headerSize + directorySize + imageSizes.reduce((a, b) => a + b, 0);
    
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, sizes.length, true);
    
    let offset = headerSize;
    let imageDataOffset = headerSize + directorySize;
    
    sizes.forEach((size) => {
      const imageSize = size * size * 4;
      
      view.setUint8(offset, size);
      view.setUint8(offset + 1, size);
      view.setUint8(offset + 2, 0);
      view.setUint8(offset + 3, 0);
      view.setUint16(offset + 4, 1, true);
      view.setUint16(offset + 6, 32, true);
      view.setUint32(offset + 8, imageSize, true);
      view.setUint32(offset + 12, imageDataOffset, true);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i++) {
          view.setUint8(imageDataOffset + i, data[i]);
        }
      }
      
      offset += 16;
      imageDataOffset += imageSize;
    });
    
    return new Blob([buffer], { type: 'image/x-icon' });
  };

  const handleExport = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.save();
      
      // Background with subtle gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 512, 512);
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 512, 512);

      // Main folder body shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Back panel of the folder (depth effect)
      ctx.beginPath();
      ctx.moveTo(70, 170);
      ctx.lineTo(442, 170);
      ctx.lineTo(442, 442);
      ctx.lineTo(70, 442);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${folderColor} 85%, #000)`;
      ctx.fill();

      // Main folder body
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
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
      ctx.fillStyle = folderColor;
      ctx.fill();

      // Top tab shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Folder tab
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(432, 80);
      ctx.quadraticCurveTo(452, 80, 452, 100);
      ctx.lineTo(452, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${folderColor} 95%, #fff)`;
      ctx.fill();

      // Inner shadow effect
      ctx.shadowColor = 'transparent';
      const innerShadow = ctx.createLinearGradient(60, 160, 60, 452);
      innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      innerShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
      innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = innerShadow;
      ctx.fill();

      // Highlight effects
      const highlight = ctx.createLinearGradient(60, 80, 452, 80);
      highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlight;
      
      // Top edge highlight
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(432, 80);
      ctx.quadraticCurveTo(452, 80, 452, 100);
      ctx.lineTo(452, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fill();

      // Add overlay image if exists
      if (overlayImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 160, 200, 192, 192);
          const icoBlob = convertToICO(canvas);
          const url = URL.createObjectURL(icoBlob);
          const link = document.createElement('a');
          link.download = 'custom-folder.ico';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        };
        img.src = overlayImage;
      } else {
        const icoBlob = convertToICO(canvas);
        const url = URL.createObjectURL(icoBlob);
        const link = document.createElement('a');
        link.download = 'custom-folder.ico';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      ctx.restore();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Créateur d'Icônes de Dossier
        </h1>

        <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
          <div className="relative w-64 h-64 flex-shrink-0">
            <canvas
              ref={canvasRef}
              width="256"
              height="256"
              className="absolute top-0 left-0"
            />
            <div className="w-full h-full">
              <Folder 
                size={256} 
                fill={folderColor}
                color={folderColor}
                className="drop-shadow-2xl"
              />
              {overlayImage && (
                <img 
                  src={overlayImage} 
                  alt="Overlay" 
                  className="absolute top-1/4 left-1/4 w-1/2 h-1/2 object-contain"
                />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-8 w-full">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Couleur du dossier
              </label>
              <div className="flex items-center gap-4">
                <Palette className="text-gray-500" size={24} />
                <input
                  type="color"
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Image superposée
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-lg font-medium"
              >
                <Upload size={24} />
                Importer une image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium"
            >
              <Download size={24} />
              Exporter en .ico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState, useRef, DragEvent } from 'react';
import { Folder, Upload, Download, Palette, RefreshCw, Move, ZoomIn, Image as ImageIcon } from 'lucide-react';
import Draggable from 'react-draggable';

function App() {
  const [folderColor, setFolderColor] = useState('#FFB900');
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(192);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOverlayImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
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
          // Apply image adjustments
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = imageSize;
          tempCanvas.height = imageSize;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.filter = `
              brightness(${brightness}%)
              contrast(${contrast}%)
              saturate(${saturation}%)
              opacity(${opacity}%)
              hue-rotate(${hue}deg)
              blur(${blur}px)
            `;

            tempCtx.drawImage(img, 0, 0, imageSize, imageSize);
            
            // Draw the adjusted image onto the main canvas
            const x = (512 - imageSize) / 2;
            const y = (512 - imageSize) / 2;
            ctx.drawImage(tempCanvas, x, y);
          }
          
          // Export as PNG
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'custom-folder.png';
          link.href = url;
          link.click();
        };
        img.src = overlayImage;
      } else {
        // Export as PNG without overlay
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'custom-folder.png';
        link.href = url;
        link.click();
      }
      
      ctx.restore();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Créateur d'Icônes de Dossier
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div 
            ref={dropZoneRef}
            className={`relative w-64 h-64 flex-shrink-0 mx-auto rounded-xl transition-all ${
              isDragging ? 'bg-blue-100 border-2 border-dashed border-blue-500' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <canvas
              ref={canvasRef}
              width="256"
              height="256"
              className="absolute top-0 left-0"
            />
            <div className="w-full h-full relative">
              <Folder 
                size={256} 
                fill={folderColor}
                color={folderColor}
                className="drop-shadow-2xl"
              />
              {overlayImage && (
                <Draggable bounds="parent">
                  <img 
                    src={overlayImage} 
                    alt="Overlay" 
                    className="absolute cursor-move"
                    style={{
                      top: '25%',
                      left: '25%',
                      width: `${imageSize / 2}px`,
                      height: `${imageSize / 2}px`,
                      objectFit: 'contain',
                      filter: `
                        brightness(${brightness}%)
                        contrast(${contrast}%)
                        saturate(${saturation}%)
                        opacity(${opacity}%)
                        hue-rotate(${hue}deg)
                        blur(${blur}px)
                      `
                    }}
                  />
                </Draggable>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
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
              <div 
                className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <p className="text-gray-600 mb-4">
                  Glissez-déposez une image ici ou
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-lg font-medium mx-auto"
                >
                  <Upload size={24} />
                  Importer une image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {overlayImage && (
              <>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Taille de l'image
                  </label>
                  <div className="flex items-center gap-4">
                    <ZoomIn className="text-gray-500" size={24} />
                    <input
                      type="range"
                      min="32"
                      max="384"
                      value={imageSize}
                      onChange={(e) => setImageSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Luminosité
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Contraste
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Saturation
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Opacité
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Teinte
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => setHue(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Flou
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium"
            >
              <Download size={24} />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
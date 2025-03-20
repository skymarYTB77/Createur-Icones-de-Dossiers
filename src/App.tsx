import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Folder, Upload, Download, Palette, Move, ZoomIn, LogIn, LogOut, LayoutDashboard, Save, Trash2 } from 'lucide-react';
import Draggable from 'react-draggable';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { saveFolderIcon, FolderIcon, savePreset, getUserPresets, Preset, deletePreset } from './services/folders';
import toast from 'react-hot-toast';

function App() {
  const [folderColor, setFolderColor] = useState('#FFB900');
  const [folderName, setFolderName] = useState('');
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [positionZ, setPositionZ] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<Preset[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadPresets = async () => {
      if (user) {
        try {
          const userPresets = await getUserPresets(user.uid);
          setPresets(userPresets);
        } catch (error) {
          toast.error('Erreur lors du chargement des préréglages');
        }
      }
    };
    loadPresets();
  }, [user]);

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

  const handleSavePreset = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!overlayImage || !presetName.trim()) {
      toast.error('Veuillez ajouter une image et un nom de préréglage');
      return;
    }

    try {
      await savePreset({
        userId: user.uid,
        name: presetName,
        imageSettings: {
          size: imageSize,
          brightness,
          contrast,
          saturation,
          opacity,
          hue,
          blur,
          positionX,
          positionY,
          positionZ
        }
      });
      toast.success('Préréglage sauvegardé');
      setShowPresetModal(false);
      setPresetName('');
      
      // Refresh presets
      const newPresets = await getUserPresets(user.uid);
      setPresets(newPresets);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du préréglage');
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePreset(presetId);
      toast.success('Préréglage supprimé');
      const newPresets = await getUserPresets(user!.uid);
      setPresets(newPresets);
    } catch (error) {
      toast.error('Erreur lors de la suppression du préréglage');
    }
  };

  const handleApplyPreset = (preset: Preset) => {
    setImageSize(preset.imageSettings.size);
    setBrightness(preset.imageSettings.brightness);
    setContrast(preset.imageSettings.contrast);
    setSaturation(preset.imageSettings.saturation);
    setOpacity(preset.imageSettings.opacity);
    setHue(preset.imageSettings.hue);
    setBlur(preset.imageSettings.blur);
    setPositionX(preset.imageSettings.positionX);
    setPositionY(preset.imageSettings.positionY);
    setPositionZ(preset.imageSettings.positionZ);
  };

  const handleExport = async () => {
    if (!folderName.trim()) {
      toast.error('Veuillez donner un nom au dossier');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Dessiner le dossier
      const drawFolder = () => {
        // Background avec gradient subtil
        const bgGradient = ctx.createLinearGradient(0, 0, 512, 512);
        bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, 512, 512);

        // Ombre du corps principal du dossier
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;

        // Panneau arrière du dossier (effet de profondeur)
        ctx.beginPath();
        ctx.moveTo(70, 170);
        ctx.lineTo(442, 170);
        ctx.lineTo(442, 442);
        ctx.lineTo(70, 442);
        ctx.closePath();
        ctx.fillStyle = `color-mix(in srgb, ${folderColor} 85%, #000)`;
        ctx.fill();

        // Corps principal du dossier
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

        // Ombre de l'onglet supérieur
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Onglet du dossier
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

        // Effet d'ombre interne
        ctx.shadowColor = 'transparent';
        const innerShadow = ctx.createLinearGradient(60, 160, 60, 452);
        innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        innerShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
        innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = innerShadow;
        ctx.fill();

        // Effets de surbrillance
        const highlight = ctx.createLinearGradient(60, 80, 452, 80);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.fill();
      };

      // Dessiner le dossier
      drawFolder();

      // Ajouter l'image superposée si elle existe
      if (overlayImage) {
        const img = new Image();
        img.onload = async () => {
          // Appliquer les ajustements d'image
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
            
            // Dessiner l'image ajustée sur le canvas principal
            const x = (512 - imageSize) / 2 + positionX;
            const y = (512 - imageSize) / 2 + positionY;
            ctx.translate(0, 0, positionZ);
            ctx.drawImage(tempCanvas, x, y);
          }

          // Sauvegarder dans Firestore si l'utilisateur est connecté
          if (user) {
            try {
              await saveFolderIcon({
                userId: user.uid,
                name: folderName,
                folderColor,
                overlayImage,
                imageSettings: {
                  size: imageSize,
                  brightness,
                  contrast,
                  saturation,
                  opacity,
                  hue,
                  blur,
                  positionX,
                  positionY,
                  positionZ
                }
              });
              toast.success('Icône sauvegardée avec succès !');
            } catch (error) {
              toast.error('Erreur lors de la sauvegarde');
            }
          }

          // Exporter en PNG
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${folderName}.png`;
          link.href = url;
          link.click();
        };
        img.src = overlayImage;
      } else {
        // Si pas d'image superposée, sauvegarder et télécharger directement
        if (user) {
          try {
            await saveFolderIcon({
              userId: user.uid,
              name: folderName,
              folderColor
            });
            toast.success('Icône sauvegardée avec succès !');
          } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
          }
        }
        
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${folderName}.png`;
        link.href = url;
        link.click();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Créateur d'Icônes de Dossier
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => setIsDashboardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LayoutDashboard size={20} />
                Tableau de bord
              </button>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut size={20} />
                Se déconnecter
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LogIn size={20} />
                Se connecter
              </button>
            )}
          </div>
        </div>

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
                <Draggable 
                  bounds="parent"
                  onDrag={(e, data) => {
                    setPositionX(data.x);
                    setPositionY(data.y);
                  }}
                >
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
                      transform: `translateZ(${positionZ}px)`,
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
                Nom du dossier
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Mon dossier"
                className="w-full p-2 border rounded-lg"
              />
            </div>

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
                    <span className="w-12 text-right">{imageSize}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Position
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="w-8">X:</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={positionX}
                        onChange={(e) => setPositionX(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="w-12 text-right">{positionX}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-8">Y:</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={positionY}
                        onChange={(e) => setPositionY(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="w-12 text-right">{positionY}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-8">Z:</span>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={positionZ}
                        onChange={(e) => setPositionZ(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="w-12 text-right">{positionZ}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Luminosité
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{brightness}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Contraste
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{contrast}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Saturation
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{saturation}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Opacité
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{opacity}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Teinte
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{hue}°</span>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Flou
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="w-12 text-right">{blur}px</span>
                  </div>
                </div>

                {presets.length > 0 && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Préréglages
                    </label>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          const preset = presets.find(p => p.id === e.target.value);
                          if (preset) handleApplyPreset(preset);
                        }}
                        className="flex-1 p-2 border rounded-lg"
                        defaultValue=""
                      >
                        <option value="" disabled>Sélectionner un préréglage</option>
                        {presets.map(preset => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const select = document.querySelector('select') as HTMLSelectElement;
                          const presetId = select.value;
                          if (presetId) handleDeletePreset(presetId);
                        }}
                        className="p-2 text-red-500 hover:text-red-600 transition-colors"
                        title="Supprimer le préréglage"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium"
              >
                <Download size={24} />
                {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
              </button>
              
              {overlayImage && user && (
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-lg font-medium"
                >
                  <Save size={24} />
                  Sauvegarder le préréglage
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onEdit={(icon) => {
          setFolderName(icon.name);
          setFolderColor(icon.folderColor);
          if (icon.overlayImage) {
            setOverlayImage(icon.overlayImage);
            if (icon.imageSettings) {
              setImageSize(icon.imageSettings.size);
              setBrightness(icon.imageSettings.brightness);
              setContrast(icon.imageSettings.contrast);
              setSaturation(icon.imageSettings.saturation);
              setOpacity(icon.imageSettings.opacity);
              setHue(icon.imageSettings.hue);
              setBlur(icon.imageSettings.blur);
              setPositionX(icon.imageSettings.positionX);
              setPositionY(icon.imageSettings.positionY);
              setPositionZ(icon.imageSettings.positionZ);
            }
          }
          setIsDashboardOpen(false);
        }}
      />

      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Sauvegarder le préréglage</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Nom du préréglage"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPresetModal(false);
                  setPresetName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePreset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

export default App
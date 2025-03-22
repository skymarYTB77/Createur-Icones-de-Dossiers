import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextTool } from './components/tools/TextTool';
import { ImageTool } from './components/tools/ImageTool';
import { DrawTool } from './components/tools/DrawTool';
import { ShapeTool } from './components/tools/ShapeTool';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings, ImageSettings, OverlaySettings, TextSettings, Shape } from './types/folder';
import { Download, LogIn, LogOut, LayoutDashboard, ArrowLeft, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { saveFolderIcon, FolderIcon } from './services/folders';
import toast from 'react-hot-toast';

const folderImages = [
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742632209/dossier-removebg-preview_vmx772.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633743/dossier_1_igyqow.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633797/dossier-vide_grouhr.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633821/dossier_2_b4iamt.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633860/dossier_3_epivkr.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633931/dossier_4_pgdjmf.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633965/dossier_5_asmnp2.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634022/dossier-3d_qjd22a.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634042/dossier-de-presse_ui3p0z.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634357/test_5_zhadkl.png'
];

function App() {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(defaultOverlaySettings);
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);
  const [drawing, setDrawing] = useState<string | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeTab, setActiveTab] = useState('text');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { user, logout } = useAuth();

  const resetSettings = () => {
    setFolderName('');
    setImageSettings(defaultImageSettings);
    setOverlaySettings(defaultOverlaySettings);
    setTextSettings(defaultTextSettings);
    setDrawing(null);
    setShapes([]);
    setHasUnsavedChanges(false);
  };

  const handleExport = async () => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (!folderName.trim()) {
      toast.error('Veuillez donner un nom au dossier');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Image principale
      const mainImg = new Image();
      mainImg.onload = async () => {
        ctx.filter = `
          brightness(${imageSettings.brightness}%)
          contrast(${imageSettings.contrast}%)
          saturate(${imageSettings.saturation}%)
          hue-rotate(${imageSettings.hue}deg)
        `;

        ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);

        // Image superposée
        if (overlaySettings.image) {
          const overlayImg = new Image();
          overlayImg.onload = () => {
            ctx.save();
            ctx.translate(
              canvas.width / 2 + overlaySettings.x,
              canvas.height / 2 + overlaySettings.y
            );
            ctx.scale(overlaySettings.scale / 100, overlaySettings.scale / 100);
            ctx.drawImage(
              overlayImg,
              -overlayImg.width / 2,
              -overlayImg.height / 2,
              overlayImg.width,
              overlayImg.height
            );
            ctx.restore();
          };
          overlayImg.src = overlaySettings.image;
        }

        // Dessin
        if (drawing) {
          const drawingImg = new Image();
          drawingImg.onload = () => {
            ctx.drawImage(drawingImg, 0, 0, canvas.width, canvas.height);
          };
          drawingImg.src = drawing;
        }

        // Formes
        shapes.forEach(shape => {
          ctx.save();
          ctx.fillStyle = shape.color;
          ctx.translate(
            canvas.width / 2 + shape.x,
            canvas.height / 2 + shape.y
          );

          if (shape.type === 'rectangle') {
            ctx.fillRect(
              -shape.width / 2,
              -shape.height / 2,
              shape.width,
              shape.height
            );
          } else if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, shape.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (shape.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -shape.height / 2);
            ctx.lineTo(shape.width / 2, shape.height / 2);
            ctx.lineTo(-shape.width / 2, shape.height / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        });

        // Texte
        if (textSettings.text) {
          ctx.save();
          ctx.font = `${textSettings.size}px ${textSettings.fontFamily}`;
          ctx.fillStyle = textSettings.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            textSettings.text,
            canvas.width / 2 + textSettings.x,
            canvas.height / 2 + textSettings.y
          );
          ctx.restore();
        }

        if (user) {
          try {
            await saveFolderIcon({
              userId: user.uid,
              name: folderName,
              image: selectedImage,
              imageSettings,
              overlayImage: overlaySettings.image ? overlaySettings : null,
              overlayText: textSettings.text ? textSettings : null,
              drawing,
              shapes: shapes.length > 0 ? shapes : null
            });
            toast.success('Icône sauvegardée avec succès !');
            setHasUnsavedChanges(false);
          } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
          }
        }

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${folderName}.png`;
        link.href = url;
        link.click();
      };
      mainImg.src = selectedImage;
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

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
    setHasUnsavedChanges(false);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      setSelectedImage(null);
      resetSettings();
    }
  };

  const renderToolPanel = () => {
    switch (activeTab) {
      case 'text':
        return (
          <TextTool
            settings={textSettings}
            onChange={(newSettings) => {
              setTextSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'image':
        return (
          <ImageTool
            settings={overlaySettings}
            onChange={(newSettings) => {
              setOverlaySettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'draw':
        return (
          <DrawTool
            onDrawingChange={(dataUrl) => {
              setDrawing(dataUrl);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'shapes':
        return (
          <ShapeTool
            onShapeAdd={(shape) => {
              setShapes([...shapes, shape]);
              setHasUnsavedChanges(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {selectedImage && (
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Retour
              </button>
            )}
            <h1 className="text-4xl font-bold text-gray-800">
              Créateur d'Icônes de Dossier
            </h1>
          </div>
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

        {!selectedImage ? (
          <div className="grid grid-cols-5 gap-6">
            {folderImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(image)}
                className="relative w-full aspect-square rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all p-4"
              >
                <img
                  src={image}
                  alt={`Dossier ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Nom du dossier
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Mon dossier"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="relative aspect-square rounded-xl border-2 border-gray-200 p-4 mb-6">
                <img
                  src={selectedImage}
                  alt="Aperçu"
                  className="w-full h-full object-contain"
                  style={{
                    filter: `
                      brightness(${imageSettings.brightness}%)
                      contrast(${imageSettings.contrast}%)
                      saturate(${imageSettings.saturation}%)
                      hue-rotate(${imageSettings.hue}deg)
                    `
                  }}
                />
                {overlaySettings.image && (
                  <img
                    src={overlaySettings.image}
                    alt="Superposition"
                    className="absolute"
                    style={{
                      top: `calc(50% + ${overlaySettings.y}px)`,
                      left: `calc(50% + ${overlaySettings.x}px)`,
                      transform: `translate(-50%, -50%) scale(${overlaySettings.scale / 100})`
                    }}
                  />
                )}
                {drawing && (
                  <img
                    src={drawing}
                    alt="Dessin"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                )}
                {shapes.map((shape, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      top: `calc(50% + ${shape.y}px)`,
                      left: `calc(50% + ${shape.x}px)`,
                      width: shape.width,
                      height: shape.height,
                      backgroundColor: shape.color,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: shape.type === 'circle' ? '50%' : undefined,
                      clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : undefined
                    }}
                  />
                ))}
                {textSettings.text && (
                  <div
                    className="absolute"
                    style={{
                      top: `calc(50% + ${textSettings.y}px)`,
                      left: `calc(50% + ${textSettings.x}px)`,
                      transform: 'translate(-50%, -50%)',
                      color: textSettings.color,
                      fontFamily: textSettings.fontFamily,
                      fontSize: `${textSettings.size}px`
                    }}
                  >
                    {textSettings.text}
                  </div>
                )}
              </div>

              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium"
              >
                <Download size={24} />
                {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
              </button>
            </div>

            <div className="flex">
              <div className="w-80 bg-gray-900 rounded-l-xl overflow-y-auto">
                {renderToolPanel()}
              </div>
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Modifications non sauvegardées</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedImage(null);
                  resetSettings();
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Abandonner
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onEdit={(icon: FolderIcon) => {
          setFolderName(icon.name);
          setSelectedImage(icon.image);
          setImageSettings(icon.imageSettings);
          if (icon.overlayImage) {
            setOverlaySettings(icon.overlayImage);
          }
          if (icon.overlayText) {
            setTextSettings(icon.overlayText);
          }
          if (icon.drawing) {
            setDrawing(icon.drawing);
          }
          if (icon.shapes) {
            setShapes(icon.shapes);
          }
          setIsDashboardOpen(false);
          setHasUnsavedChanges(false);
        }}
      />
    </div>
  );
}

export default App;
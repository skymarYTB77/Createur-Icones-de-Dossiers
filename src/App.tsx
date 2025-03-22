import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextTool } from './components/tools/TextTool';
import { ImageTool } from './components/tools/ImageTool';
import { FolderTool } from './components/tools/FolderTool';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings, ImageSettings, OverlaySettings, TextSettings } from './types/folder';
import { Download, LogIn, LogOut, LayoutDashboard, ArrowLeft, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { saveFolderIcon } from './services/folders';
import toast from 'react-hot-toast';
import Draggable from 'react-draggable';

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
  const [activeTab, setActiveTab] = useState('folder');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { user, logout } = useAuth();

  const handleDrag = (type: 'text' | 'image', data: { x: number; y: number }) => {
    if (type === 'text') {
      setTextSettings(prev => ({
        ...prev,
        x: data.x,
        y: data.y
      }));
    } else {
      setOverlaySettings(prev => ({
        ...prev,
        x: data.x,
        y: data.y
      }));
    }
    setHasUnsavedChanges(true);
  };

  const resetSettings = () => {
    setFolderName('');
    setImageSettings(defaultImageSettings);
    setOverlaySettings(defaultOverlaySettings);
    setTextSettings(defaultTextSettings);
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
      try {
        // Charger l'image principale
        const mainImg = new Image();
        mainImg.crossOrigin = 'anonymous';
        
        mainImg.onload = async () => {
          // Appliquer les filtres à l'image principale
          ctx.filter = `
            brightness(${imageSettings.brightness}%)
            contrast(${imageSettings.contrast}%)
            saturate(${imageSettings.saturation}%)
            hue-rotate(${imageSettings.hue}deg)
          `;

          // Dessiner l'image principale
          ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);

          // Réinitialiser les filtres
          ctx.filter = 'none';

          // Gérer l'image superposée
          if (overlaySettings.image) {
            const overlayImg = new Image();
            overlayImg.crossOrigin = 'anonymous';
            
            overlayImg.onload = () => {
              // Calculer les positions centrées
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              const scale = overlaySettings.scale / 100;

              ctx.save();
              // Appliquer la transformation pour l'image superposée
              ctx.translate(
                centerX + overlaySettings.x,
                centerY + overlaySettings.y
              );
              ctx.scale(scale, scale);

              // Dessiner l'image superposée centrée
              ctx.drawImage(
                overlayImg,
                -overlayImg.width / 2,
                -overlayImg.height / 2
              );
              ctx.restore();

              // Ajouter le texte après l'image superposée
              if (textSettings.text) {
                ctx.save();
                ctx.font = `${textSettings.size}px ${textSettings.fontFamily}`;
                ctx.fillStyle = textSettings.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Dessiner le texte à la position calculée
                ctx.fillText(
                  textSettings.text,
                  centerX + textSettings.x,
                  centerY + textSettings.y
                );
                ctx.restore();
              }

              finishExport();
            };
            overlayImg.src = overlaySettings.image;
          } else if (textSettings.text) {
            // Si pas d'image superposée mais du texte
            ctx.save();
            ctx.font = `${textSettings.size}px ${textSettings.fontFamily}`;
            ctx.fillStyle = textSettings.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Dessiner le texte à la position calculée
            ctx.fillText(
              textSettings.text,
              canvas.width / 2 + textSettings.x,
              canvas.height / 2 + textSettings.y
            );
            ctx.restore();
            finishExport();
          } else {
            finishExport();
          }
        };

        const finishExport = async () => {
          if (user) {
            try {
              await saveFolderIcon({
                userId: user.uid,
                name: folderName,
                image: selectedImage,
                imageSettings,
                overlayImage: overlaySettings.image ? overlaySettings : null,
                overlayText: textSettings.text ? textSettings : null,
                drawing: null,
                shapes: null
              });
              toast.success('Icône sauvegardée avec succès !');
              setHasUnsavedChanges(false);
            } catch (error) {
              toast.error('Erreur lors de la sauvegarde');
            }
          }

          try {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${folderName}.png`;
            link.href = url;
            link.click();
          } catch (error) {
            toast.error('Erreur lors de l\'exportation de l\'image');
          }
        };

        mainImg.src = selectedImage;
      } catch (error) {
        toast.error('Erreur lors de la génération de l\'image');
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
      case 'folder':
        return (
          <FolderTool
            settings={imageSettings}
            onChange={(newSettings) => {
              setImageSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white flex items-center justify-center">
      <div className="bg-[#1a1a3a] backdrop-blur-xl bg-opacity-80 w-full min-h-screen border border-[#2a2a5a]">
        <div className="p-4 flex flex-col h-screen">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {selectedImage && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a2a5a] hover:bg-[#3a3a7a] rounded-xl transition-all duration-300"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
              )}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Créateur d'Icônes de Dossier
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setIsDashboardOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
                >
                  <LayoutDashboard size={20} />
                  Tableau de bord
                </button>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a2a5a] hover:bg-[#3a3a7a] rounded-xl transition-all duration-300"
                >
                  <LogOut size={20} />
                  Se déconnecter
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
                >
                  <LogIn size={20} />
                  Se connecter
                </button>
              )}
            </div>
          </div>

          {!selectedImage ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 flex-1 overflow-y-auto p-4">
              {folderImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(image)}
                  className="group relative aspect-square rounded-2xl border-2 border-[#2a2a5a] hover:border-blue-500 transition-all duration-300 p-4 bg-[#1a1a3a] hover:bg-[#2a2a5a] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={image}
                    alt={`Dossier ${index + 1}`}
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 flex-1">
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <label className="block text-lg font-medium mb-3">
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
                    className="w-full p-3 bg-[#2a2a5a] border border-[#3a3a7a] rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white"
                  />
                </div>

                <div className="relative flex-1 rounded-2xl border-2 border-[#2a2a5a] p-4 mb-6 bg-[#1a1a3a] flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Aperçu"
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
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
                      <Draggable
                        position={{ x: overlaySettings.x, y: overlaySettings.y }}
                        onDrag={(e, data) => handleDrag('image', data)}
                      >
                        <img
                          src={overlaySettings.image}
                          alt="Superposition"
                          className="absolute cursor-move pointer-events-auto"
                          crossOrigin="anonymous"
                          style={{
                            transform: `translate(-50%, -50%) scale(${overlaySettings.scale / 100})`,
                            width: '200px',
                            height: '200px',
                            objectFit: 'contain',
                            touchAction: 'none',
                            zIndex: 10
                          }}
                        />
                      </Draggable>
                    )}
                    {textSettings.text && (
                      <Draggable
                        position={{ x: textSettings.x, y: textSettings.y }}
                        onDrag={(e, data) => handleDrag('text', data)}
                      >
                        <div
                          className="absolute cursor-move pointer-events-auto"
                          style={{
                            transform: 'translate(-50%, -50%)',
                            color: textSettings.color,
                            fontFamily: textSettings.fontFamily,
                            fontSize: `${textSettings.size}px`,
                            touchAction: 'none',
                            zIndex: 20,
                            textShadow: '0 0 10px rgba(0,0,0,0.3)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {textSettings.text}
                        </div>
                      </Draggable>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  <Download size={24} />
                  {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
                </button>
              </div>

              <div className="flex">
                <div className="w-80 bg-[#1a1a3a] border-y border-l border-[#2a2a5a] rounded-l-xl overflow-y-auto">
                  {renderToolPanel()}
                </div>
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a3a] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#2a2a5a]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Modifications non sauvegardées</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedImage(null);
                  resetSettings();
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
              >
                Abandonner
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
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
        onEdit={(icon) => {
          setFolderName(icon.name);
          setSelectedImage(icon.image);
          setImageSettings(icon.imageSettings);
          if (icon.overlayImage) {
            setOverlaySettings(icon.overlayImage);
          }
          if (icon.overlayText) {
            setTextSettings(icon.overlayText);
          }
          setIsDashboardOpen(false);
          setHasUnsavedChanges(false);
        }}
      />
    </div>
  );
}

export default App;
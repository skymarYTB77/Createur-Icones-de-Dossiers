import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextTool } from './components/tools/TextTool';
import { ImageTool } from './components/tools/ImageTool';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings } from './types/folder';
import { Download, LogIn, LogOut, LayoutDashboard, ArrowLeft, X, Save } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { PresetModal } from './components/PresetModal';
import { saveFolderIcon } from './services/folders';
import toast from 'react-hot-toast';
import Draggable from 'react-draggable';
import { motion } from 'framer-motion';

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
  const [imageSettings, setImageSettings] = useState(defaultImageSettings);
  const [overlaySettings, setOverlaySettings] = useState(defaultOverlaySettings);
  const [textSettings, setTextSettings] = useState(defaultTextSettings);
  const [activeTab, setActiveTab] = useState('text');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  
  const { user, logout } = useAuth();

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
      const mainImg = new Image();
      mainImg.onload = async () => {
        ctx.filter = `
          brightness(${imageSettings.brightness}%)
          contrast(${imageSettings.contrast}%)
          saturate(${imageSettings.saturation}%)
          hue-rotate(${imageSettings.hue}deg)
        `;

        ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);

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
              drawing: null,
              shapes: null
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

  const handleDragStop = (type: 'text' | 'image', data: { x: number; y: number }) => {
    if (type === 'text') {
      setTextSettings(prev => ({
        ...prev,
        x: prev.x + data.x,
        y: prev.y + data.y
      }));
    } else {
      setOverlaySettings(prev => ({
        ...prev,
        x: prev.x + data.x,
        y: prev.y + data.y
      }));
    }
    setHasUnsavedChanges(true);
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-12 rounded-2xl shadow-2xl max-w-6xl w-full border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {selectedImage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={20} />
                Retour
              </motion.button>
            )}
            <h1 className="text-4xl font-bold text-white">
              Créateur d'Icônes de Dossier
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPresetModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={20} />
                  Préréglages
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDashboardOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LayoutDashboard size={20} />
                  Tableau de bord
                </motion.button>
              </>
            )}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut size={20} />
                Se déconnecter
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn size={20} />
                Se connecter
              </motion.button>
            )}
          </div>
        </div>

        {!selectedImage ? (
          <div className="grid grid-cols-5 gap-6">
            {folderImages.map((image, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleImageSelect(image)}
                className="relative w-full aspect-square rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all p-4 bg-gray-800"
              >
                <img
                  src={image}
                  alt={`Dossier ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <label className="block text-lg font-medium text-white mb-3">
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-xl border-2 border-gray-700 p-4 mb-6 bg-gray-800"
              >
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
                  <Draggable
                    onStop={(e, data) => handleDragStop('image', data)}
                    position={{x: overlaySettings.x, y: overlaySettings.y}}
                  >
                    <img
                      src={overlaySettings.image}
                      alt="Superposition"
                      className="absolute cursor-move"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) scale(${overlaySettings.scale / 100})`
                      }}
                    />
                  </Draggable>
                )}
                {textSettings.text && (
                  <Draggable
                    onStop={(e, data) => handleDragStop('text', data)}
                    position={{x: textSettings.x, y: textSettings.y}}
                  >
                    <div
                      className="absolute cursor-move"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: textSettings.color,
                        fontFamily: textSettings.fontFamily,
                        fontSize: `${textSettings.size}px`
                      }}
                    >
                      {textSettings.text}
                    </div>
                  </Draggable>
                )}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <Download size={24} />
                {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
              </motion.button>
            </div>

            <div className="flex">
              <div className="w-80 bg-gray-800 rounded-l-xl overflow-y-auto border-l border-gray-700">
                {renderToolPanel()}
              </div>
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        )}
      </motion.div>

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

      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentSettings={{
          imageSettings,
          overlaySettings,
          textSettings
        }}
        onLoad={(preset) => {
          setImageSettings(preset.imageSettings);
          setOverlaySettings(preset.overlaySettings);
          setTextSettings(preset.textSettings);
          setIsPresetModalOpen(false);
          toast.success('Préréglage chargé !');
        }}
      />
    </div>
  );
}

export default App;
import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { ImageEditor } from './components/ImageEditor';
import { saveFolderIcon, FolderIcon } from './services/folders';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings, ImageSettings, OverlaySettings, TextSettings } from './types/folder';
import toast from 'react-hot-toast';

function App() {
  const [folderName, setFolderName] = useState('');
  const [folderImage, setFolderImage] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(defaultOverlaySettings);
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFolderImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: false
  });

  const handleExport = async () => {
    if (!folderImage) {
      toast.error('Veuillez importer une image');
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

        ctx.drawImage(
          mainImg,
          0,
          0,
          canvas.width,
          canvas.height
        );

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

        // Texte superposé
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
              image: folderImage,
              imageSettings,
              overlayImage: overlaySettings.image ? overlaySettings : null,
              overlayText: textSettings.text ? textSettings : null
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
      };
      mainImg.src = folderImage;
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
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-6xl w-full">
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

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2">
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Nom du dossier
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Mon dossier"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div 
              {...getRootProps()}
              className={`
                w-full aspect-square rounded-xl border-2 border-dashed
                flex flex-col items-center justify-center
                transition-colors cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${folderImage ? 'p-4' : 'p-8'}
              `}
            >
              <input {...getInputProps()} />
              {folderImage ? (
                <div ref={previewRef} className="relative w-full h-full">
                  <img
                    src={folderImage}
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
                        top: `${50 + overlaySettings.y}%`,
                        left: `${50 + overlaySettings.x}%`,
                        transform: `translate(-50%, -50%) scale(${overlaySettings.scale / 100})`
                      }}
                    />
                  )}
                  {textSettings.text && (
                    <div
                      className="absolute"
                      style={{
                        top: `${50 + textSettings.y}%`,
                        left: `${50 + textSettings.x}%`,
                        transform: 'translate(-50%, -50%)',
                        color: textSettings.color,
                        fontSize: `${textSettings.size}px`,
                        fontFamily: textSettings.fontFamily
                      }}
                    >
                      {textSettings.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez une image ici ou
                  </p>
                  <button className="text-blue-500 hover:text-blue-600 font-medium">
                    Parcourir
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={!folderImage}
              className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={24} />
              {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
            </button>
          </div>

          <div className="lg:w-1/2 overflow-y-auto max-h-[800px] pr-4">
            {folderImage && (
              <ImageEditor
                settings={imageSettings}
                overlaySettings={overlaySettings}
                textSettings={textSettings}
                onChange={setImageSettings}
                onOverlayChange={setOverlaySettings}
                onTextChange={setTextSettings}
              />
            )}
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
        onEdit={(icon: FolderIcon) => {
          setFolderName(icon.name);
          setFolderImage(icon.image);
          setImageSettings(icon.imageSettings);
          if (icon.overlayImage) {
            setOverlaySettings(icon.overlayImage);
          }
          if (icon.overlayText) {
            setTextSettings(icon.overlayText);
          }
          setIsDashboardOpen(false);
        }}
      />
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { StylePicker } from './components/StylePicker';
import { AdminLogin } from './components/AdminLogin';
import { defaultImageSettings, ImageSettings, FolderStyle } from './types/folder';
import { getFolderStyles } from './lib/folderStyles';
import { auth, isUserAdmin } from './lib/firebase';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function App() {
  const [folderName, setFolderName] = useState('');
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings);
  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [styles, setStyles] = useState<FolderStyle[]>([]);
  const [currentStyle, setCurrentStyle] = useState<FolderStyle | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Charger les styles
    const loadStyles = async () => {
      try {
        const loadedStyles = await getFolderStyles();
        setStyles(loadedStyles);
        if (loadedStyles.length > 0) {
          setCurrentStyle(loadedStyles[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des styles:', error);
        toast.error('Erreur lors du chargement des styles');
      }
    };
    loadStyles();

    // Vérifier si l'utilisateur est admin
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAdmin(isUserAdmin(user.uid));
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePreviewDoubleClick = () => {
    setIsStylePickerOpen(true);
  };

  const renderPreview = () => {
    if (!currentStyle) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Appliquer les paramètres
      ctx.filter = `
        brightness(${imageSettings.brightness}%)
        contrast(${imageSettings.contrast}%)
        saturate(${imageSettings.saturation}%)
        opacity(${imageSettings.opacity}%)
      `;

      // Rendre le dossier avec le style actuel
      currentStyle.render(ctx, imageSettings.color, imageSettings);
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Créateur d'Icônes de Dossier
          </h1>
          {!isAdmin && (
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Shield size={20} />
              Admin
            </button>
          )}
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
              className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 p-4 cursor-pointer"
              onDoubleClick={handlePreviewDoubleClick}
            >
              {currentStyle && (
                <img
                  src={renderPreview()}
                  alt="Aperçu"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <p className="text-sm text-gray-500 text-center mt-2">
              Double-cliquez sur l'aperçu pour changer le style du dossier
            </p>
          </div>

          <div className="lg:w-1/2">
            <ImageEditor
              settings={imageSettings}
              onChange={setImageSettings}
            />
          </div>
        </div>
      </div>

      <StylePicker
        isOpen={isStylePickerOpen}
        onClose={() => setIsStylePickerOpen(false)}
        onStyleSelect={setCurrentStyle}
        styles={styles}
        currentColor={imageSettings.color}
      />

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme, background, setBackground } = useTheme();
  const [backgroundUrl, setBackgroundUrl] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (backgroundUrl) {
      setBackground(backgroundUrl);
      setBackgroundUrl('');
    }
  };

  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a3a] rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Thème */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thème
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
            >
              <option value="neon">Thème Néon</option>
              <option value="light">Thème Éclairé</option>
              <option value="dark">Thème Sombre</option>
            </select>
          </div>

          {/* Fond d'écran */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fond d'écran
            </label>
            
            <div className="space-y-4">
              {/* Upload */}
              <div className="border-2 border-dashed border-[#3a3a7a] rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label htmlFor="background-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">
                    Cliquez pour importer une image
                  </p>
                </label>
              </div>

              {/* URL */}
              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <input
                  type="url"
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
                  placeholder="Ou collez un lien d'image"
                />
                <button
                  type="submit"
                  disabled={!backgroundUrl}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Appliquer
                </button>
              </form>

              {background && (
                <button
                  onClick={() => setBackground(null)}
                  className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer le fond
                </button>
              )}
            </div>
          </div>

          {/* Cache */}
          <div>
            <button
              onClick={clearCache}
              className="w-full py-2 bg-[#2a2a5a] text-white rounded-lg hover:bg-[#3a3a7a] transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              Vider le cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getUserPresets, savePreset, deletePreset, Preset } from '../services/presets';
import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';
import toast from 'react-hot-toast';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (preset: Preset) => void;
  currentSettings: {
    imageSettings: ImageSettings;
    overlaySettings: OverlaySettings;
    textSettings: TextSettings;
  };
}

export function PresetModal({ isOpen, onClose, onLoad, currentSettings }: PresetModalProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadPresets = async () => {
      if (!user) return;
      try {
        const userPresets = await getUserPresets(user.uid);
        setPresets(userPresets);
      } catch (error) {
        toast.error('Erreur lors du chargement des préréglages');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPresets();
    }
  }, [user, isOpen]);

  const handleSavePreset = async () => {
    if (!user || !newPresetName.trim()) return;

    try {
      await savePreset({
        userId: user.uid,
        name: newPresetName,
        ...currentSettings
      });
      toast.success('Préréglage sauvegardé !');
      setNewPresetName('');
      const updatedPresets = await getUserPresets(user.uid);
      setPresets(updatedPresets);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePreset(presetId);
      setPresets(presets.filter(p => p.id !== presetId));
      toast.success('Préréglage supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Préréglages</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Nom du préréglage"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Chargement des préréglages...
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Aucun préréglage sauvegardé
              </div>
            ) : (
              presets.map((preset) => (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between group hover:bg-gray-750 transition-colors"
                >
                  <button
                    onClick={() => onLoad(preset)}
                    className="flex-1 text-left text-white hover:text-blue-400 transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id!)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
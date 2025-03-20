import { useEffect, useState } from 'react';
import { Folder, Trash2, Edit, Download, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolderIcons, FolderIcon, deleteFolderIcon, savePreset, getUserPresets, Preset, ImageSettings } from '../services/folders';
import toast from 'react-hot-toast';

interface DashboardProps {
  onClose: () => void;
  onEdit: (icon: FolderIcon) => void;
}

export function Dashboard({ onClose, onEdit }: DashboardProps) {
  const [icons, setIcons] = useState<FolderIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<FolderIcon | null>(null);
  const [presetName, setPresetName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [userIcons, userPresets] = await Promise.all([
          getUserFolderIcons(user.uid),
          getUserPresets(user.uid)
        ]);
        setIcons(userIcons);
        setPresets(userPresets);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleDelete = async (iconId: string) => {
    try {
      await deleteFolderIcon(iconId);
      toast.success('Icône supprimée avec succès');
      setIcons(icons.filter(icon => icon.id !== iconId));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSavePreset = async () => {
    if (!selectedIcon?.imageSettings || !presetName.trim() || !user) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      await savePreset({
        userId: user.uid,
        name: presetName,
        imageSettings: selectedIcon.imageSettings
      });
      toast.success('Préréglage sauvegardé');
      setShowPresetModal(false);
      setPresetName('');
      setSelectedIcon(null);
      
      // Refresh presets
      const newPresets = await getUserPresets(user.uid);
      setPresets(newPresets);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du préréglage');
    }
  };

  const handleApplyPreset = (preset: Preset, icon: FolderIcon) => {
    onEdit({
      ...icon,
      imageSettings: preset.imageSettings
    });
  };

  const handleDownload = async (icon: FolderIcon) => {
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
      ctx.fillStyle = `color-mix(in srgb, ${icon.folderColor} 85%, #000)`;
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
      ctx.fillStyle = icon.folderColor;
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
      ctx.fillStyle = `color-mix(in srgb, ${icon.folderColor} 95%, #fff)`;
      ctx.fill();

      if (icon.overlayImage) {
        const img = new Image();
        img.onload = () => {
          const size = icon.imageSettings?.size || 192;
          const x = (512 - size) / 2;
          const y = (512 - size) / 2;
          
          ctx.filter = `
            brightness(${icon.imageSettings?.brightness || 100}%)
            contrast(${icon.imageSettings?.contrast || 100}%)
            saturate(${icon.imageSettings?.saturation || 100}%)
            opacity(${icon.imageSettings?.opacity || 100}%)
            hue-rotate(${icon.imageSettings?.hue || 0}deg)
            blur(${icon.imageSettings?.blur || 0}px)
          `;
          
          ctx.drawImage(img, x, y, size, size);
          
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `folder-${icon.id}.png`;
          link.href = url;
          link.click();
        };
        img.src = icon.overlayImage;
      } else {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `folder-${icon.id}.png`;
        link.href = url;
        link.click();
      }
      
      ctx.restore();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes icônes de dossier</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos icônes...</p>
          </div>
        ) : icons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Vous n'avez pas encore créé d'icônes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative w-32 h-32 mb-4">
                  <Folder
                    size={128}
                    fill={icon.folderColor}
                    color={icon.folderColor}
                    className="drop-shadow-md"
                  />
                  {icon.overlayImage && (
                    <img
                      src={icon.overlayImage}
                      alt="Overlay"
                      className="absolute"
                      style={{
                        top: '25%',
                        left: '25%',
                        width: `${(icon.imageSettings?.size || 192) / 2}px`,
                        height: `${(icon.imageSettings?.size || 192) / 2}px`,
                        objectFit: 'contain',
                        filter: `
                          brightness(${icon.imageSettings?.brightness || 100}%)
                          contrast(${icon.imageSettings?.contrast || 100}%)
                          saturate(${icon.imageSettings?.saturation || 100}%)
                          opacity(${icon.imageSettings?.opacity || 100}%)
                          hue-rotate(${icon.imageSettings?.hue || 0}deg)
                          blur(${icon.imageSettings?.blur || 0}px)
                        `
                      }}
                    />
                  )}
                </div>

                {icon.imageSettings && (
                  <div className="w-full mb-4 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Taille: {icon.imageSettings.size}</div>
                      <div>Luminosité: {icon.imageSettings.brightness}%</div>
                      <div>Contraste: {icon.imageSettings.contrast}%</div>
                      <div>Saturation: {icon.imageSettings.saturation}%</div>
                      <div>Opacité: {icon.imageSettings.opacity}%</div>
                      <div>Teinte: {icon.imageSettings.hue}°</div>
                      <div>Flou: {icon.imageSettings.blur}px</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => onEdit(icon)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={14} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(icon.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                  <button
                    onClick={() => handleDownload(icon)}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    <Download size={14} />
                    Télécharger
                  </button>
                  {icon.imageSettings && (
                    <button
                      onClick={() => {
                        setSelectedIcon(icon);
                        setShowPresetModal(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                    >
                      <Save size={14} />
                      Préréglage
                    </button>
                  )}
                </div>

                {presets.length > 0 && (
                  <div className="mt-2 w-full">
                    <select
                      onChange={(e) => {
                        const preset = presets.find(p => p.id === e.target.value);
                        if (preset) handleApplyPreset(preset, icon);
                      }}
                      className="w-full text-sm p-1 border rounded"
                      defaultValue=""
                    >
                      <option value="" disabled>Charger un préréglage</option>
                      {presets.map(preset => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
                  setSelectedIcon(null);
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
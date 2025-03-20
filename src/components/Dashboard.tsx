import { useEffect, useState } from 'react';
import { Folder, Trash2, Edit, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolderIcons, FolderIcon, deleteFolderIcon } from '../services/folders';
import toast from 'react-hot-toast';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (icon: FolderIcon) => void;
}

export function Dashboard({ isOpen, onClose, onEdit }: DashboardProps) {
  const [icons, setIcons] = useState<FolderIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const userIcons = await getUserFolderIcons(user.uid);
        setIcons(userIcons);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (iconId: string) => {
    try {
      await deleteFolderIcon(iconId);
      toast.success('Icône supprimée avec succès');
      setIcons(icons.filter(icon => icon.id !== iconId));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
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
      ctx.fill();

      if (icon.overlayImage) {
        const img = new Image();
        img.onload = () => {
          const settings = icon.imageSettings || {
            size: 192,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            opacity: 100,
            hue: 0,
            blur: 0,
            positionX: 0,
            positionY: 0,
            positionZ: 0
          };

          const x = 256 - (settings.size / 2) + settings.positionX;
          const y = 256 - (settings.size / 2) + settings.positionY;
          
          ctx.filter = `
            brightness(${settings.brightness}%)
            contrast(${settings.contrast}%)
            saturate(${settings.saturation}%)
            opacity(${settings.opacity}%)
            hue-rotate(${settings.hue}deg)
            blur(${settings.blur}px)
          `;
          
          ctx.drawImage(img, x, y, settings.size, settings.size);
          
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${icon.name || 'folder'}.png`;
          link.href = url;
          link.click();
        };
        img.src = icon.overlayImage;
      } else {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${icon.name || 'folder'}.png`;
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
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translate(${icon.imageSettings?.positionX || 0}px, ${icon.imageSettings?.positionY || 0}px) translateZ(${icon.imageSettings?.positionZ || 0}px)`,
                        width: `${((icon.imageSettings?.size || 192) / 512) * 128}px`,
                        height: `${((icon.imageSettings?.size || 192) / 512) * 128}px`,
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

                <h3 className="text-lg font-medium text-gray-800 mb-2 text-center">
                  {icon.name || 'Sans nom'}
                </h3>

                <div className="flex gap-1 justify-center mt-2">
                  <button
                    onClick={() => onEdit(icon)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(icon.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(icon)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
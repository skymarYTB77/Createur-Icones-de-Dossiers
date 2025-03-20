import { useEffect, useState } from 'react';
import { Folder, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolderIcons, FolderIcon } from '../services/folders';
import toast from 'react-hot-toast';

interface DashboardProps {
  onClose: () => void;
  onEdit: (icon: FolderIcon) => void;
}

export function Dashboard({ onClose, onEdit }: DashboardProps) {
  const [icons, setIcons] = useState<FolderIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadIcons = async () => {
      if (!user) return;
      try {
        const userIcons = await getUserFolderIcons(user.uid);
        setIcons(userIcons);
      } catch (error) {
        toast.error('Erreur lors du chargement des icônes');
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, [user]);

  const handleDelete = async (iconId: string) => {
    try {
      // Implement delete functionality
      toast.success('Icône supprimée avec succès');
      setIcons(icons.filter(icon => icon.id !== iconId));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
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
                className="bg-gray-50 rounded-lg p-4 flex flex-col items-center"
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onEdit(icon)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(icon.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                    Supprimer
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
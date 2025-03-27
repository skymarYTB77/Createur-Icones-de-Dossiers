import React, { useEffect, useState } from 'react';
import { FileIcon, Download, Loader2, Save } from 'lucide-react';

interface ExportToolProps {
  isExporting: boolean;
  onExport: (format: 'ico' | 'png') => void;
}

export function ExportTool({ isExporting, onExport }: ExportToolProps) {
  const [selectedFormat, setSelectedFormat] = useState<'ico' | 'png'>(() => {
    const saved = localStorage.getItem('preferredFormat');
    return (saved === 'ico' || saved === 'png') ? saved : 'png';
  });

  useEffect(() => {
    localStorage.setItem('preferredFormat', selectedFormat);
  }, [selectedFormat]);

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format</h3>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="format"
            checked={selectedFormat === 'ico'}
            onChange={() => setSelectedFormat('ico')}
            className="w-5 h-5 text-blue-500"
          />
          <div className="flex items-center gap-3">
            <FileIcon size={24} className="text-blue-500" />
            <div>
              <div className="font-medium">Fichier ICO</div>
              <div className="text-sm text-gray-500">Format Windows standard pour les icônes</div>
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="format"
            checked={selectedFormat === 'png'}
            onChange={() => setSelectedFormat('png')}
            className="w-5 h-5 text-blue-500"
          />
          <div className="flex items-center gap-3">
            <Download size={24} className="text-green-500" />
            <div>
              <div className="font-medium">Image PNG</div>
              <div className="text-sm text-gray-500">Format haute qualité avec transparence</div>
            </div>
          </div>
        </label>

        <button
          onClick={() => onExport(selectedFormat)}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Download size={20} />
              <span>Télécharger</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Informations</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Le format ICO inclut plusieurs tailles pour une compatibilité optimale</li>
          <li>• Le format PNG est idéal pour une utilisation web ou personnalisée</li>
          <li>• La conversion peut prendre quelques secondes selon la complexité</li>
        </ul>
      </div>
    </div>
  );
}
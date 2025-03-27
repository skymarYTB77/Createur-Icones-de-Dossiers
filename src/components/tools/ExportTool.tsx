import React, { useState, useEffect } from 'react';
import { FileIcon, Download } from 'lucide-react';

interface ExportToolProps {
  isExporting: boolean;
  onExport: (format: 'ico' | 'png') => void;
}

export function ExportTool({ isExporting, onExport }: ExportToolProps) {
  const [selectedFormat, setSelectedFormat] = useState<'ico' | 'png'>(() => {
    const saved = localStorage.getItem('selectedFormat');
    return (saved === 'ico' || saved === 'png') ? saved : 'png';
  });

  useEffect(() => {
    localStorage.setItem('selectedFormat', selectedFormat);
  }, [selectedFormat]);

  const handleExport = () => {
    onExport(selectedFormat);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format</h3>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="format"
            value="ico"
            checked={selectedFormat === 'ico'}
            onChange={(e) => setSelectedFormat(e.target.value as 'ico' | 'png')}
            className="w-5 h-5 text-blue-500"
          />
          <div className="flex items-center gap-3">
            <FileIcon size={24} className="text-black" />
            <div className="font-medium text-black">ICO</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="format"
            value="png"
            checked={selectedFormat === 'png'}
            onChange={(e) => setSelectedFormat(e.target.value as 'ico' | 'png')}
            className="w-5 h-5 text-blue-500"
          />
          <div className="flex items-center gap-3">
            <Download size={24} className="text-black" />
            <div className="font-medium text-black">PNG</div>
          </div>
        </label>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Exportation en cours...
            </>
          ) : (
            <>
              <Download size={20} />
              Exporter en {selectedFormat.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
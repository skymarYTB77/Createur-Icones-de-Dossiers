import React from 'react';
import { FileIcon, Download } from 'lucide-react';

interface ExportToolProps {
  isExporting: boolean;
  onExport: (format: 'ico' | 'png') => void;
}

export function ExportTool({ isExporting, onExport }: ExportToolProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format</h3>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="format"
            value="ico"
            onChange={(e) => onExport(e.target.value as 'ico' | 'png')}
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
            defaultChecked
            onChange={(e) => onExport(e.target.value as 'ico' | 'png')}
            className="w-5 h-5 text-blue-500"
          />
          <div className="flex items-center gap-3">
            <Download size={24} className="text-black" />
            <div className="font-medium text-black">PNG</div>
          </div>
        </label>
      </div>
    </div>
  );
}
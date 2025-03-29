import React, { useEffect, useState } from 'react';
import { ExportFormat } from '../../types/folder';

interface FormatToolProps {
  format: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function FormatTool({ format, onChange }: FormatToolProps) {
  useEffect(() => {
    const savedFormat = localStorage.getItem('exportFormat') as ExportFormat;
    if (savedFormat) {
      onChange(savedFormat);
    }
  }, [onChange]);

  const handleFormatChange = (newFormat: ExportFormat) => {
    localStorage.setItem('exportFormat', newFormat);
    onChange(newFormat);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format d'export</h3>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            checked={format === 'png'}
            onChange={() => handleFormatChange('png')}
            className="form-radio text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-700">.PNG</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            checked={format === 'ico'}
            onChange={() => handleFormatChange('ico')}
            className="form-radio text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-700">.ICO</span>
        </label>
      </div>
    </div>
  );
}
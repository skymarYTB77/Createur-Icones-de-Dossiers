import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { OverlaySettings } from '../../types/folder';

interface ImageToolProps {
  settings: OverlaySettings;
  onChange: (settings: OverlaySettings) => void;
}

export function ImageTool({ settings, onChange }: ImageToolProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange({
            ...settings,
            image: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const updateSetting = (key: keyof OverlaySettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Image superposée</h3>
      
      {!settings.image ? (
        <div 
          {...getRootProps()} 
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-400">
            Cliquez ou glissez une image ici
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={settings.image} 
              alt="Superposition" 
              className="w-16 h-16 object-contain bg-gray-700 rounded"
            />
            <button
              onClick={() => onChange({ ...settings, image: '' })}
              className="text-red-400 text-sm hover:text-red-300"
            >
              Supprimer
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position X
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.x}
              onChange={(e) => updateSetting('x', Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position Y
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.y}
              onChange={(e) => updateSetting('y', Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Échelle
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={settings.scale}
              onChange={(e) => updateSetting('scale', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}
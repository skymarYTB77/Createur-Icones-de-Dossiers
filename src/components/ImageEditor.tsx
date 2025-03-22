import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { ImageSettings } from '../types/folder';
import { Sun, Contrast, Palette, Eye } from 'lucide-react';

interface ImageEditorProps {
  settings: ImageSettings;
  onChange: (settings: ImageSettings) => void;
}

export function ImageEditor({ settings, onChange }: ImageEditorProps) {
  const updateSetting = (key: keyof ImageSettings, value: number | string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Couleur du dossier
        </label>
        <HexColorPicker
          color={settings.color}
          onChange={(color) => updateSetting('color', color)}
          className="w-full max-w-[200px]"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Luminosité
        </label>
        <div className="flex items-center gap-4">
          <Sun className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.brightness}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.brightness}%</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Contraste
        </label>
        <div className="flex items-center gap-4">
          <Contrast className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.contrast}
            onChange={(e) => updateSetting('contrast', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.contrast}%</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Saturation
        </label>
        <div className="flex items-center gap-4">
          <Palette className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.saturation}
            onChange={(e) => updateSetting('saturation', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.saturation}%</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Opacité
        </label>
        <div className="flex items-center gap-4">
          <Eye className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            onChange={(e) => updateSetting('opacity', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.opacity}%</span>
        </div>
      </div>
    </div>
  );
}
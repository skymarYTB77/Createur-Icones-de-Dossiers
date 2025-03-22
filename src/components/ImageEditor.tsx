import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { ImageSettings } from '../types/folder';
import { Sun, Contrast, Palette, Eye, RotateCw, Bluetooth as Blur, Scale, Droplet, MoveHorizontal, MoveVertical, Maximize } from 'lucide-react';

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
          Échelle
        </label>
        <div className="flex items-center gap-4">
          <Scale className="text-gray-500" size={24} />
          <input
            type="range"
            min="10"
            max="200"
            value={settings.scale}
            onChange={(e) => updateSetting('scale', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.scale}%</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Rotation
        </label>
        <div className="flex items-center gap-4">
          <RotateCw className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="360"
            value={settings.rotation}
            onChange={(e) => updateSetting('rotation', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.rotation}°</span>
        </div>
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

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Teinte
        </label>
        <div className="flex items-center gap-4">
          <Droplet className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="360"
            value={settings.hue}
            onChange={(e) => updateSetting('hue', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.hue}°</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Flou
        </label>
        <div className="flex items-center gap-4">
          <Blur className="text-gray-500" size={24} />
          <input
            type="range"
            min="0"
            max="20"
            value={settings.blur}
            onChange={(e) => updateSetting('blur', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right">{settings.blur}px</span>
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Ombre
        </label>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Couleur</label>
            <HexColorPicker
              color={settings.shadowColor}
              onChange={(color) => updateSetting('shadowColor', color)}
              className="w-full max-w-[200px]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Flou</label>
            <div className="flex items-center gap-4">
              <Maximize className="text-gray-500" size={24} />
              <input
                type="range"
                min="0"
                max="50"
                value={settings.shadowBlur}
                onChange={(e) => updateSetting('shadowBlur', Number(e.target.value))}
                className="w-full"
              />
              <span className="w-16 text-right">{settings.shadowBlur}px</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Décalage horizontal
            </label>
            <div className="flex items-center gap-4">
              <MoveHorizontal className="text-gray-500" size={24} />
              <input
                type="range"
                min="-50"
                max="50"
                value={settings.shadowOffsetX}
                onChange={(e) => updateSetting('shadowOffsetX', Number(e.target.value))}
                className="w-full"
              />
              <span className="w-16 text-right">{settings.shadowOffsetX}px</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Décalage vertical
            </label>
            <div className="flex items-center gap-4">
              <MoveVertical className="text-gray-500" size={24} />
              <input
                type="range"
                min="-50"
                max="50"
                value={settings.shadowOffsetY}
                onChange={(e) => updateSetting('shadowOffsetY', Number(e.target.value))}
                className="w-full"
              />
              <span className="w-16 text-right">{settings.shadowOffsetY}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
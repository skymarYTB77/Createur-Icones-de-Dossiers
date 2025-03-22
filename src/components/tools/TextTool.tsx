import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { TextSettings } from '../../types/folder';

interface TextToolProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
}

export function TextTool({ settings, onChange }: TextToolProps) {
  const updateSetting = (key: keyof TextSettings, value: string | number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Texte superposé</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Texte
        </label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => updateSetting('text', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          placeholder="Entrez votre texte"
        />
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
          Taille
        </label>
        <input
          type="range"
          min="8"
          max="72"
          value={settings.size}
          onChange={(e) => updateSetting('size', Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Couleur
        </label>
        <HexColorPicker
          color={settings.color}
          onChange={(color) => updateSetting('color', color)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Police
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
    </div>
  );
}
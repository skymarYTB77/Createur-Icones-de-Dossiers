import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { TextSettings } from '../../types/folder';

interface TextToolProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
}

export function TextTool({ settings, onChange }: TextToolProps) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Texte superposé</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte
        </label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => onChange({ ...settings, text: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Entrez votre texte"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taille
        </label>
        <input
          type="range"
          min="8"
          max="72"
          value={settings.size}
          onChange={(e) => onChange({ ...settings, size: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur
        </label>
        <HexColorPicker
          color={settings.color}
          onChange={(color) => onChange({ ...settings, color })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Police
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
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
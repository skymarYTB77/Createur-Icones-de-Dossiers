import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { TextSettings } from '../../types/folder';
import { motion } from 'framer-motion';

interface TextToolProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
}

export function TextTool({ settings, onChange }: TextToolProps) {
  const updateSetting = (key: keyof TextSettings, value: string | number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h3 className="text-xl font-medium mb-6">Texte superposé</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Texte
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={settings.text}
            onChange={(e) => updateSetting('text', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Entrez votre texte"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Taille
          </label>
          <motion.input
            whileTap={{ scale: 1.02 }}
            type="range"
            min="8"
            max="72"
            value={settings.size}
            onChange={(e) => updateSetting('size', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-right text-sm text-gray-400">
            {settings.size}px
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Police
          </label>
          <motion.select
            whileTap={{ scale: 1.02 }}
            value={settings.fontFamily}
            onChange={(e) => updateSetting('fontFamily', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </motion.select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Couleur
          </label>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-2 bg-gray-700 rounded-lg"
          >
            <HexColorPicker
              color={settings.color}
              onChange={(color) => updateSetting('color', color)}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
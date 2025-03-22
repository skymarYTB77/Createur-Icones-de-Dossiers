import React from 'react';
import { FolderStyle } from '../types/folder';

interface StylePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onStyleSelect: (style: FolderStyle) => void;
  styles: FolderStyle[];
  currentColor: string;
}

export function StylePicker({ isOpen, onClose, onStyleSelect, styles, currentColor }: StylePickerProps) {
  if (!isOpen) return null;

  const renderPreview = (style: FolderStyle) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.scale(0.25, 0.25);
      style.render(ctx, currentColor);
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choisir un style de dossier</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleSelect(style);
                onClose();
              }}
              className="p-4 rounded-lg hover:bg-gray-50 transition-all"
            >
              <img
                src={renderPreview(style)}
                alt={style.name}
                className="w-full h-auto mb-2"
              />
              <span className="block text-center text-sm font-medium">
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
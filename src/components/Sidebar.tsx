import React from 'react';
import { Type, Image, Pencil, Square, Circle, Triangle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tools = [
    { id: 'text', icon: Type, label: 'Texte' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'draw', icon: Pencil, label: 'Dessin' },
    { id: 'shapes', icon: Square, label: 'Formes' }
  ];

  return (
    <div className="w-20 bg-gray-800 border-l border-gray-700 flex flex-col items-center py-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onTabChange(tool.id)}
          className={`w-16 h-16 mb-2 flex flex-col items-center justify-center rounded-lg transition-colors ${
            activeTab === tool.id
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <tool.icon size={24} />
          <span className="text-xs mt-1">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
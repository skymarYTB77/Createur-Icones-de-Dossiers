import React from 'react';
import { Type, Image } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tools = [
    { id: 'text', icon: Type, label: 'Texte' },
    { id: 'image', icon: Image, label: 'Image' }
  ];

  return (
    <div className="w-64 bg-gray-100 border-l border-gray-200 flex flex-col items-center py-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onTabChange(tool.id)}
          className={`w-full h-16 mb-2 flex items-center justify-center gap-2 rounded-lg transition-colors ${
            activeTab === tool.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <tool.icon size={24} />
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
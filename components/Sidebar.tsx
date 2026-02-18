
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const navItems: { id: ViewType; icon: string; label: string }[] = [
    { id: 'DASHBOARD', icon: 'dashboard', label: 'Dashboard' },
    { id: 'GATE_SCAN', icon: 'sensor_window', label: 'Scanner' },
    { id: 'FLOOR_MAP', icon: 'map', label: 'Map' },
    { id: 'VISITOR_LOGS', icon: 'assignment', label: 'Logs' },
    { id: 'AFTER_HOURS', icon: 'nightlight_round', label: 'Night Watch' },
  ];

  return (
    <aside className="w-20 border-r border-white/5 bg-[#111] flex flex-col items-center py-6 gap-8 z-50">
      <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
        <span className="material-icons-round font-bold">local_parking</span>
      </div>

      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${
              activeView === item.id 
                ? 'bg-primary/10 text-primary' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <span className="material-icons-round text-2xl">{item.icon}</span>
            <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity uppercase tracking-widest font-bold z-50 border border-white/10">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 items-center">
        <button 
            onClick={() => onViewChange('SETTINGS')}
            className={`transition-colors ${activeView === 'SETTINGS' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
        >
          <span className="material-icons-round">settings</span>
        </button>
        <button 
            onClick={() => onViewChange('PROFILE')}
            className={`w-8 h-8 rounded-lg overflow-hidden border transition-all ${activeView === 'PROFILE' ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 hover:border-primary'}`}
        >
          <img src="https://picsum.photos/32/32" alt="Avatar" className="w-full h-full object-cover" />
        </button>
      </div>
    </aside>
  );
};

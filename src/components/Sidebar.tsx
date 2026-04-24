import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Video, Library, Settings, Plus, Zap } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'editor';
  onViewChange: (view: 'dashboard' | 'editor') => void;
  onNewProject: () => void;
}

export default function Sidebar({ currentView, onViewChange, onNewProject }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'All Projects', icon: Video },
    { id: 'library', label: 'Asset Library', icon: Library },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0A0A0F] flex flex-col h-full z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl text-white">M</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Morphosis AI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Character Studio</p>
          </div>
        </div>

        <button 
          onClick={onNewProject}
          className="w-full py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 mb-8 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Start New Bake
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 font-medium border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-indigo-400' : ''}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-white transition-colors text-sm">
          <Settings className="w-4 h-4" />
          System Settings
        </button>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { ModuleId, SimulationPreset } from '../types/physics';
import {
  Zap,
  Activity,
  Compass,
  Magnet,
  Eye,
  Waves as WavesIcon,
  Flame,
  Globe,
  Search,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  presets: SimulationPreset[];
  activePresetId: string;
  onSelectPreset: (preset: SimulationPreset) => void;
}

interface ModuleGroup {
  id: ModuleId;
  name: string;
  icon: React.ElementType;
}

const MODULE_GROUPS: ModuleGroup[] = [
  { id: 'electrostatics', name: 'Electrostatics', icon: Zap },
  { id: 'mechanics', name: 'Kinematics & Dynamics', icon: Activity },
  { id: 'optics', name: 'Ray & Wave Optics', icon: Eye },
  { id: 'shm_oscillations', name: 'SHM & Oscillations', icon: Compass },
  { id: 'magnetism_emi', name: 'Magnetism & EMI', icon: Magnet },
  { id: 'waves', name: 'Wave Phenomena', icon: WavesIcon },
  { id: 'thermodynamics', name: 'Thermodynamics', icon: Flame },
  { id: 'gravitation', name: 'Gravitation & Orbits', icon: Globe },
];

export const Sidebar: React.FC<SidebarProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>('all');

  const filteredPresets = presets.filter((preset) => {
    const matchesSearch =
      preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.chapterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || preset.moduleId === selectedModule;
    return matchesSearch && matchesModule;
  });

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] text-slate-300 shrink-0 select-none">
      {/* Search Input */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search JEE topics & sims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 text-slate-200 text-xs border border-slate-800 focus:outline-none focus:border-cyan-500/80 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedModule('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedModule === 'all'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Chapters
          </button>
          {MODULE_GROUPS.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedModule === mod.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Topic List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredPresets.map((preset) => {
          const isActive = preset.id === activePresetId;
          const ModIcon =
            MODULE_GROUPS.find((m) => m.id === preset.moduleId)?.icon || Sparkles;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                  <ModIcon className="w-3.5 h-3.5" />
                  {preset.chapterName}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    preset.tag === 'JEE Advanced'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {preset.tag}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1">
                {preset.title}
              </h4>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-600" />
                  {preset.challenges.length} Interactive Challenges
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 group-hover:text-cyan-400 transition-all" />
              </div>
            </div>
          );
        })}

        {filteredPresets.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No simulations match your query. Try another keyword.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Engine: Math RK4 / 2D Canvas</span>
        <span className="font-mono text-cyan-500/80">60 FPS</span>
      </div>
    </aside>
  );
};

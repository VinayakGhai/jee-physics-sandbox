import React from 'react';
import { Atom, Play, Sparkles, BookOpen, Layers, Settings, HelpCircle, ShieldCheck, Code, Sliders } from 'lucide-react';
import { ModuleId, LearningMode } from '../types/physics';

interface NavbarProps {
  activeModuleId: ModuleId;
  activePresetTitle: string;
  learningMode: LearningMode;
  onSelectLearningMode: (mode: LearningMode) => void;
  onToggleAITeacher: () => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
  isAITeacherOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModuleId,
  activePresetTitle,
  learningMode,
  onSelectLearningMode,
  onToggleAITeacher,
  onOpenArchitecture,
  onOpenSettings,
  isAITeacherOpen,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-slate-100 select-none z-20">
      {/* Brand & App Identifier */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Atom className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">JEE Sandbox</h1>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 border border-slate-700/60">
              v1.0 Tauri Linux
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate max-w-[220px] md:max-w-md">
            {activePresetTitle}
          </p>
        </div>
      </div>

      {/* Learning Mode Segmented Control */}
      <div className="hidden lg:flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
        {(['explore', 'challenge', 'experiment', 'socratic'] as LearningMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSelectLearningMode(mode)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              learningMode === mode
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {mode} Mode
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Architecture Documentation View */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
          title="View Software Architecture & JEE Physics Roadmap"
        >
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Architecture & Roadmap</span>
        </button>

        {/* AI Mentor Drawer Button */}
        <button
          onClick={onToggleAITeacher}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            isAITeacherOpen
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Mentor</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          title="App Settings & API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

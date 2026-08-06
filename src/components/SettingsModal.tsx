import React, { useState } from 'react';
import { AIProviderConfig } from '../types/physics';
import { Settings, Key, Server, Cpu, Check, X, Shield, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (cfg: AIProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState<AIProviderConfig['provider']>(config.provider || 'gemini');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey,
      customEndpoint,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">App Settings & AI Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Provider Choice */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">AI Explanation Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gemini', label: 'Gemini (Default)' },
                { id: 'groq', label: 'Groq API' },
                { id: 'openrouter', label: 'OpenRouter' },
                { id: 'ollama', label: 'Ollama Local' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`px-3 py-2 rounded-xl border text-left font-medium transition-colors ${
                    provider === p.id
                      ? 'bg-slate-800 border-cyan-500/80 text-cyan-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              API Key ({provider.toUpperCase()})
            </label>
            <input
              type="password"
              placeholder="Enter custom API Key (or leave blank to use server environment)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Leave empty to use process.env.GEMINI_API_KEY injected automatically by Google AI Studio.
            </p>
          </div>

          {/* Endpoint if custom/ollama */}
          {provider === 'ollama' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ollama Endpoint URL</label>
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          )}

          {/* Performance Settings Info */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Target Performance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              GPU 2D Canvas rendering & RK4 solver are locked at 60 FPS for desktop fluid experience.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors text-xs font-bold shadow-md shadow-cyan-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

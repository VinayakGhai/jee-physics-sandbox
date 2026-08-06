import React from 'react';
import { ParameterControl } from '../types/physics';
import { Sliders, RotateCcw, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface ControlPanelProps {
  controls: ParameterControl[];
  params: Record<string, number>;
  onParamChange: (id: string, value: number) => void;
  onResetParams: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  controls,
  params,
  onParamChange,
  onResetParams,
}) => {
  return (
    <div className="bg-slate-900 border-l border-slate-800 p-4 w-80 h-full flex flex-col justify-between overflow-y-auto text-slate-200 select-none shrink-0">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight text-white">Variable Controls</h3>
          </div>
          <button
            onClick={onResetParams}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Variables to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {controls.map((ctrl) => {
            const currentVal = params[ctrl.id] !== undefined ? params[ctrl.id] : ctrl.value;

            return (
              <div key={ctrl.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {ctrl.label}
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {currentVal} {ctrl.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={currentVal}
                  onChange={(e) => onParamChange(ctrl.id, parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>{ctrl.min} {ctrl.unit}</span>
                  <span>{ctrl.max} {ctrl.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Physics Engine Status */}
      <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Solver</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Variables update calculations, field vectors, trajectories, and formulas instantly without delay.
        </p>
      </div>
    </div>
  );
};

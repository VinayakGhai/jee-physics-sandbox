import React from 'react';
import katex from 'katex';
import { LiveFormula } from '../types/physics';
import { Calculator } from 'lucide-react';

interface FormulaEngineProps {
  formulas: LiveFormula[];
  params: Record<string, number>;
}

export const FormulaEngine: React.FC<FormulaEngineProps> = ({ formulas }) => {
  const renderMath = (latex: string) => {
    try {
      return {
        __html: katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
        }),
      };
    } catch {
      return { __html: latex };
    }
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 select-none">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold tracking-tight text-slate-200 uppercase">
          Live Math Expression & Formula Engine
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {formulas.map((formula, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-amber-400 block mb-2">
                {formula.title}
              </span>

              {/* Clean Rendered KaTeX Math Output */}
              <div
                className="text-cyan-300 text-sm bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 mb-2 overflow-x-auto flex justify-center items-center min-h-[52px]"
                dangerouslySetInnerHTML={renderMath(formula.latexTemplate)}
              />
            </div>

            {/* Live Numeric Evaluation */}
            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60 text-slate-300">
              <span className="text-slate-500">Live Evaluation:</span>
              <span className="text-emerald-400 font-bold bg-slate-900 px-2.5 py-1 rounded border border-emerald-500/20">
                {formula.evaluatedString}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


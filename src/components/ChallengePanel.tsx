import React, { useState } from 'react';
import katex from 'katex';
import { ChallengeGoal } from '../types/physics';
import { Trophy, HelpCircle, CheckCircle2, ArrowRight, Sparkles, Award } from 'lucide-react';


interface ChallengePanelProps {
  challenges: ChallengeGoal[];
  currentSimData: any;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ challenges, currentSimData }) => {
  const [showHintId, setShowHintId] = useState<string | null>(null);

  if (!challenges || challenges.length === 0) return null;

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 select-none">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold tracking-tight text-slate-200 uppercase">
          JEE Main & Advanced Discovery Challenges
        </h3>
      </div>

      <div className="space-y-3">
        {challenges.map((ch) => {
          const evalResult = ch.checkFn(currentSimData || {});
          const isSuccess = evalResult.isSuccess;
          const progress = Math.min(100, Math.max(0, evalResult.progressPercent));

          return (
            <div
              key={ch.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white">{ch.title}</h4>
                    {isSuccess && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                        <Award className="w-3 h-3" /> Solved!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{ch.description}</p>
                </div>

                <button
                  onClick={() => setShowHintId(showHintId === ch.id ? null : ch.id)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors shrink-0"
                  title="Toggle Hint"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{ch.targetConditionText}</span>
                  <span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {evalResult.currentValText}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isSuccess ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-cyan-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Hint Accordion */}
              {showHintId === ch.id && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: `<strong>JEE Hint:</strong> ${ch.hint.replace(/\$(.+?)\$/g, (_, math) => {
                        try {
                          return katex.renderToString(math, { displayMode: false, throwOnError: false });
                        } catch {
                          return math;
                        }
                      })}`
                    }}
                  />
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

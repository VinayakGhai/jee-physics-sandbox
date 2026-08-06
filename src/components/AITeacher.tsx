import React, { useState } from 'react';
import katex from 'katex';
import { ChatMessage, AIProviderConfig } from '../types/physics';
import { Sparkles, Send, X, Bot, User, HelpCircle, BookOpen, Zap, AlertTriangle } from 'lucide-react';


interface AITeacherProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  simulationState: any;
  providerConfig: AIProviderConfig;
}

export const AITeacher: React.FC<AITeacherProps> = ({
  isOpen,
  onClose,
  topicTitle,
  simulationState,
  providerConfig,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **JEE Mentor AI**. I analyze your live simulation variables in real time. Ask me anything about ${topicTitle}, physical derivations, symmetry tricks, or common JEE Main & Advanced traps!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explainMode, setExplainMode] = useState<'socratic' | 'explore' | 'derivation' | 'jee_tricks'>('socratic');

  if (!isOpen) return null;

  const handleSendPrompt = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          simulationState,
          prompt: textToSend,
          mode: explainMode,
          apiKey: providerConfig.apiKey,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text || 'Explanation generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      // Offline / Unconfigured Key Socratic Fallback
      let fallbackText = '';
      const topic = topicTitle.toLowerCase();
      const params = simulationState?.params || {};

      if (topic.includes('coulomb') || topic.includes('electrostatics')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Coulomb Force & Screening**: Dielectric constant $K$ screens electric field by factor of $1/K$. Current parameters: $q_1 = ${params.q1 || 4}\\mu C, q_2 = ${params.q2 || -4}\\mu C, r = ${params.dist || 2.5}m, K = ${params.dielectric || 1}$.
- **JEE Exam Tip**: Remember that net field at neutral point is $E_{net} = 0 \implies \frac{q_1}{r_1^2} = \frac{q_2}{r_2^2}$. Try setting $q_1 = 9\\mu C$ and $q_2 = 4\\mu C$ to locate it!`;
      } else if (topic.includes('projectile') || topic.includes('kinematics')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Parabolic Motion**: Horizontal velocity $v_x = v_0 \\cos\\theta$ remains constant (ignoring drag), while $v_y$ decreases at rate $g$.
- **JEE Exam Tip**: Maximum horizontal range occurs at $\\theta = 45^\\circ$ because $\\sin(2\\theta)$ reaches its maximum of 1 at $2\\theta = 90^\\circ$.`;
      } else if (topic.includes('thermodynamics') || topic.includes('pv')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Work Done in Gas Processes**: $W = \\int P dV$ corresponds to the area under the $P-V$ curve.
- **Isothermal Expansion**: $W = P_1 V_1 \\ln(V_2/V_1) = ${((params.p1||4)*(params.v1||2)*Math.log((params.v2||6)/(params.v1||2))).toFixed(2)}$ L·atm. Since temperature is constant, $\\Delta U = 0 \\implies Q = W$.`;
      } else if (topic.includes('orbit') || topic.includes('gravitation')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Orbital Dynamics**: Circular speed $v_o = \\sqrt{\\frac{GM}{r}}$. Escape speed is $\\sqrt{2}$ times circular speed ($v_e = \\sqrt{\\frac{2GM}{R}}$).
- **Kepler's 3rd Law**: $T^2 \\propto a^3$. Energy of orbit is $E = -\\frac{GMm}{2a}$.`;
      } else if (topic.includes('rc') || topic.includes('circuit')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Transient RC Charging**: $V_C(t) = V_0(1 - e^{-t/\\tau})$ where time constant $\\tau = RC = ${(params.resistance||10)*(params.capacitance||100)*1e-3}$ s.
- At $t = \\tau$, capacitor charges to $63.2\\%$ of supply voltage $V_0$.`;
      } else if (topic.includes('rolling') || topic.includes('rotation')) {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- **Rolling Down Incline**: Acceleration $a = \\frac{g \\sin\\theta}{1 + k^2/R^2}$.
- Solid Sphere ($k^2/R^2 = 0.4$) rolls faster than Cylinder ($0.5$) and Ring ($1.0$) because less energy is diverted into rotational kinetic energy!`;
      } else {
        fallbackText = `💡 **JEE Mentor Physics Insight (${explainMode.toUpperCase()})**:
- Analyzing live parameters: ${JSON.stringify(params)}.
- Experiment with slider values in real time to observe live graph telemetry and dynamic LaTeX equation changes!`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  const quickPrompts = [
    'Why does dielectric constant reduce net force?',
    'Guide me Socratic style to solve this challenge',
    'What is the standard JEE Advanced trap in this topic?',
    'Derive the formula step-by-step',
  ];

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">JEE Physics Mentor AI</h3>
            <p className="text-[10px] text-amber-400 font-mono">Gemini 3.6 Flash Server Engine</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/80 grid grid-cols-2 gap-1 text-[10px]">
        {[
          { id: 'socratic', label: 'Socratic Guiding', icon: HelpCircle },
          { id: 'explore', label: 'Physical Intuition', icon: Zap },
          { id: 'derivation', label: 'Derivation', icon: BookOpen },
          { id: 'jee_tricks', label: 'JEE Exam Traps', icon: AlertTriangle },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = explainMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setExplainMode(m.id as any)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-amber-400" />
                  <span>JEE Mentor</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none font-sans'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap font-sans'
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.text.replace(/\$(.+?)\$/g, (_, math) => {
                  try {
                    return katex.renderToString(math, { displayMode: false, throwOnError: false });
                  } catch {
                    return math;
                  }
                })
              }}
            />

          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-amber-400 text-xs py-2 font-mono animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Analyzing physical state & generating teacher insights...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(qp)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask mentor about formulas, vectors..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};

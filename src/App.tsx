import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { FormulaEngine } from './components/FormulaEngine';
import { GraphEngine } from './components/GraphEngine';
import { ChallengePanel } from './components/ChallengePanel';
import { AITeacher } from './components/AITeacher';
import { ArchitectureView } from './components/ArchitectureView';
import { SettingsModal } from './components/SettingsModal';

import { SIMULATION_PRESETS } from './data/simulationsData';
import { SimulationPreset, LearningMode, GraphDataPoint, AIProviderConfig } from './types/physics';
import { PhysicsEngine } from './engine/physicsEngine';

export default function App() {
  const [activePreset, setActivePreset] = useState<SimulationPreset>(() => {
    const savedPresetId = localStorage.getItem('jee_active_preset_id');
    if (savedPresetId) {
      const found = SIMULATION_PRESETS.find((p) => p.id === savedPresetId);
      if (found) return found;
    }
    return SIMULATION_PRESETS[0];
  });

  // Telemetry session tracking
  useEffect(() => {
    const getSessionId = () => {
      let id = localStorage.getItem('jee_session_id');
      if (!id) {
        id = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('jee_session_id', id);
      }
      return id;
    };

    const sendPing = () => {
      fetch('/api/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          presetId: activePreset.id,
        }),
      }).catch(() => {
        // ignore errors gracefully (e.g. offline)
      });
    };

    sendPing();
    const interval = setInterval(sendPing, 30000);
    return () => clearInterval(interval);
  }, [activePreset.id]);


  const [learningMode, setLearningMode] = useState<LearningMode>('explore');
  const [activeBottomTab, setActiveBottomTab] = useState<'formula' | 'graph' | 'challenge'>('formula');

  // Simulation Parameters state loaded from session storage
  const [params, setParams] = useState<Record<string, number>>(() => {
    const savedPresetId = localStorage.getItem('jee_active_preset_id') || SIMULATION_PRESETS[0].id;
    const savedParams = localStorage.getItem(`jee_params_${savedPresetId}`);
    if (savedParams) {
      try {
        return JSON.parse(savedParams);
      } catch {
        // fallback to default
      }
    }
    return SIMULATION_PRESETS[0].defaultParams;
  });

  // Real-time Graph Data History
  const [graphHistory, setGraphHistory] = useState<GraphDataPoint[]>([]);

  // Probe readout
  const [probeData, setProbeData] = useState<any>(null);

  // Live simulation tick data for challenges
  const [liveSimData, setLiveSimData] = useState<any>({ params: SIMULATION_PRESETS[0].defaultParams });

  // Modals & Drawers
  const [isAITeacherOpen, setIsAITeacherOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Provider Configuration (Persistent across sessions)
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => {
    const savedConfig = localStorage.getItem('jee_ai_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch {
        // fallback
      }
    }
    return { provider: 'gemini', apiKey: '' };
  });

  // Save AI Config on change
  const handleSaveAiConfig = (newConfig: AIProviderConfig) => {
    setAiConfig(newConfig);
    localStorage.setItem('jee_ai_config', JSON.stringify(newConfig));
  };

  // Switch Active Preset and load stored parameters
  const handleSelectPreset = (preset: SimulationPreset) => {
    setActivePreset(preset);
    localStorage.setItem('jee_active_preset_id', preset.id);

    const savedParams = localStorage.getItem(`jee_params_${preset.id}`);
    if (savedParams) {
      try {
        setParams(JSON.parse(savedParams));
      } catch {
        setParams(preset.defaultParams);
      }
    } else {
      setParams(preset.defaultParams);
    }
    setGraphHistory([]);
    setLiveSimData({ params: preset.defaultParams });
  };

  // Update Variable Slider & sync session
  const handleParamChange = (id: string, val: number) => {
    setParams((prev) => {
      const next = { ...prev, [id]: val };
      localStorage.setItem(`jee_params_${activePreset.id}`, JSON.stringify(next));
      return next;
    });
  };

  const handleResetParams = () => {
    setParams(activePreset.defaultParams);
    localStorage.removeItem(`jee_params_${activePreset.id}`);
    setGraphHistory([]);
  };

  // --- Export / Import Simulation State ---

  const handleExportState = () => {
    const state = {
      version: '1.0',
      preset: activePreset.id,
      params: { ...params },
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-sandbox-${activePreset.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportState = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.preset && data.params) {
            const preset = SIMULATION_PRESETS.find((p) => p.id === data.preset);
            if (preset) {
              handleSelectPreset(preset);
              setParams(data.params);
              localStorage.setItem(`jee_params_${preset.id}`, JSON.stringify(data.params));
            }
          }
        } catch {
          console.error('Failed to parse setup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Sim Tick Callback
  const handleSimTick = (timeSec: number, simData: any) => {
    setLiveSimData(simData);

    // Record Graph Data Point periodically
    if (activePreset.supportedGraphKeys.length > 0) {
      const dataPt: GraphDataPoint = { t: timeSec };

      activePreset.supportedGraphKeys.forEach((keyConfig) => {
        if (keyConfig.key === 'force') {
          const q1 = params.q1 || 4;
          const q2 = params.q2 || -4;
          const r = params.dist || 2.5;
          const K = params.dielectric || 1;
          dataPt['force'] = (9.0e9 / K) * (Math.abs(q1 * q2 * 1e-12) / (r * r));
        } else if (keyConfig.key === 'potentialAtProbe') {
          dataPt['potentialAtProbe'] = probeData ? probeData.V / 1000 : 0;
        } else if (keyConfig.key === 'posY' && simData.particle) {
          dataPt['posY'] = simData.particle.y;
        } else if (keyConfig.key === 'vy' && simData.particle) {
          dataPt['vy'] = simData.particle.vy;
        } else if (keyConfig.key === 'theta' && simData.pendulumState) {
          dataPt['theta'] = simData.pendulumState.theta;
        } else if (keyConfig.key === 'omega' && simData.pendulumState) {
          dataPt['omega'] = simData.pendulumState.omega;
        } else if (keyConfig.key === 'dipoleTorque') {
          const p = params.pMag || 5;
          const E = params.eField || 10;
          const rad = ((params.angleDeg || 30) * Math.PI) / 180;
          dataPt['dipoleTorque'] = p * E * Math.sin(rad);
        } else if (keyConfig.key === 'dipoleEnergy') {
          const p = params.pMag || 5;
          const E = params.eField || 10;
          const rad = ((params.angleDeg || 30) * Math.PI) / 180;
          dataPt['dipoleEnergy'] = -p * E * Math.cos(rad);
        } else if (keyConfig.key === 'gaussEField') {
          const r = params.gaussianRadius || 15;
          const R = params.sphereRadius || 10;
          const Q = params.totalCharge || 5;
          const isCond = (params.isConducting ?? 1) === 1;
          const state = PhysicsEngine.calcGaussSphereFieldAndPotential(r, R, Q, isCond);
          dataPt['gaussEField'] = state.E / 1000;
        } else if (keyConfig.key === 'gaussPotential') {
          const r = params.gaussianRadius || 15;
          const R = params.sphereRadius || 10;
          const Q = params.totalCharge || 5;
          const isCond = (params.isConducting ?? 1) === 1;
          const state = PhysicsEngine.calcGaussSphereFieldAndPotential(r, R, Q, isCond);
          dataPt['gaussPotential'] = state.V / 1000;
        } else if (keyConfig.key === 'capacitanceVal') {
          const state = PhysicsEngine.calcCapacitorState(
            params.areaCm2 || 100,
            params.distMm || 5,
            params.dielectricK || 3.0,
            params.voltage || 12,
            (params.isBatteryConnected ?? 1) === 1
          );
          dataPt['capacitanceVal'] = state.C * 1e12; // in pF
        } else if (keyConfig.key === 'storedEnergy') {
          const state = PhysicsEngine.calcCapacitorState(
            params.areaCm2 || 100,
            params.distMm || 5,
            params.dielectricK || 3.0,
            params.voltage || 12,
            (params.isBatteryConnected ?? 1) === 1
          );
          dataPt['storedEnergy'] = state.storedEnergy * 1e9; // in nJ
        } else if (keyConfig.key === 'imageDist') {

          const f = params.focalLength || 15;
          const u = params.objectDist || -30;
          const invV = 1 / f + 1 / u;
          dataPt['imageDist'] = Math.abs(invV) > 1e-6 ? 1 / invV : 0;
        } else if (keyConfig.key === 'fringeWidth') {
          const lambda = (params.wavelength || 600) * 1e-9;
          const D = params.screenDist || 1.5;
          const d = (params.slitSeparation || 0.5) * 1e-3;
          dataPt['fringeWidth'] = (lambda * D / d) * 1e3;
        } else if (keyConfig.key === 'workDone') {
          const p1 = params.p1 || 4;
          const v1 = params.v1 || 2;
          const v2 = params.v2 || 6;
          dataPt['workDone'] = p1 * v1 * Math.log(v2 / v1);
        } else if (keyConfig.key === 'pressureP2') {
          const p1 = params.p1 || 4;
          const v1 = params.v1 || 2;
          const v2 = params.v2 || 6;
          dataPt['pressureP2'] = p1 * (v1 / v2);
        } else if (keyConfig.key === 'orbitSpeed' && simData.particle) {
          dataPt['orbitSpeed'] = Math.sqrt(simData.particle.vx ** 2 + simData.particle.vy ** 2);
        } else if (keyConfig.key === 'vCapacitor') {
          const v0 = params.vSource || 12;
          const r = params.resistance || 10;
          const c = params.capacitance || 100;
          const tau = r * c * 1e-3;
          dataPt['vCapacitor'] = v0 * (1 - Math.exp(-timeSec / Math.max(1e-4, tau)));
        } else if (keyConfig.key === 'iCurrent') {
          const v0 = params.vSource || 12;
          const r = params.resistance || 10;
          const c = params.capacitance || 100;
          const tau = r * c * 1e-3;
          dataPt['iCurrent'] = (v0 / r) * Math.exp(-timeSec / Math.max(1e-4, tau));
        } else if (keyConfig.key === 'rollingAccel') {
          const angle = (params.inclineAngle || 30) * (Math.PI / 180);
          dataPt['rollingAccel'] = (9.8 * Math.sin(angle)) / 1.4;
        }
      });


      setGraphHistory((prev) => {
        const next = [...prev, dataPt];
        return next.length > 200 ? next.slice(-200) : next;
      });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Navbar */}
      <Navbar
        activeModuleId={activePreset.moduleId}
        activePresetTitle={`${activePreset.chapterName}: ${activePreset.title}`}
        learningMode={learningMode}
        onSelectLearningMode={setLearningMode}
        onToggleAITeacher={() => setIsAITeacherOpen(!isAITeacherOpen)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAITeacherOpen={isAITeacherOpen}
        onExportState={handleExportState}
        onImportState={handleImportState}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Chapter Catalogue */}
        <Sidebar
          presets={SIMULATION_PRESETS}
          activePresetId={activePreset.id}
          onSelectPreset={handleSelectPreset}
        />

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Simulation Stage & Controls Split */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Interactive Canvas HUD */}
            <SimulationCanvas
              preset={activePreset}
              params={params}
              onProbeUpdate={(data) => setProbeData(data)}
              onSimTick={handleSimTick}
            />

            {/* Variable Slider Control Panel */}
            <ControlPanel
              controls={activePreset.controls}
              params={params}
              onParamChange={handleParamChange}
              onResetParams={handleResetParams}
            />
          </div>

          {/* Bottom Interactive Dashboard */}
          <div className="bg-slate-900 border-t border-slate-800 shrink-0">
            {/* Bottom Panel Selector */}
            <div className="flex items-center gap-2 px-4 pt-2 border-b border-slate-800 bg-slate-950 text-xs">
              <button
                onClick={() => setActiveBottomTab('formula')}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                  activeBottomTab === 'formula'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Live Formulas & Math
              </button>
              <button
                onClick={() => setActiveBottomTab('graph')}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                  activeBottomTab === 'graph'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Real-Time Telemetry Graph
              </button>
              <button
                onClick={() => setActiveBottomTab('challenge')}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                  activeBottomTab === 'challenge'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                JEE Challenges ({activePreset.challenges.length})
              </button>
            </div>

            {/* Selected Panel Content */}
            {activeBottomTab === 'formula' && (
              <FormulaEngine formulas={activePreset.formulas} params={params} />
            )}
            {activeBottomTab === 'graph' && (
              <GraphEngine
                supportedKeys={activePreset.supportedGraphKeys}
                dataHistory={graphHistory}
                onClearHistory={() => setGraphHistory([])}
              />
            )}
            {activeBottomTab === 'challenge' && (
              <ChallengePanel
                challenges={activePreset.challenges}
                currentSimData={liveSimData}
              />
            )}
          </div>
        </div>

        {/* AI Mentor Drawer Sidebar */}
        <AITeacher
          isOpen={isAITeacherOpen}
          onClose={() => setIsAITeacherOpen(false)}
          topicTitle={activePreset.title}
          simulationState={{
            chapter: activePreset.chapterName,
            params,
            probeData,
          }}
          providerConfig={aiConfig}
          onSaveConfig={handleSaveAiConfig}
        />
      </div>

      {/* Architecture Documentation Modal */}
      {isArchitectureOpen && (
        <ArchitectureView onClose={() => setIsArchitectureOpen(false)} />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveAiConfig}
      />
    </div>
  );
}

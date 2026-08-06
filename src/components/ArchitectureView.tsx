import React, { useState } from 'react';
import {
  Code,
  Layers,
  Cpu,
  Database,
  Sparkles,
  CheckCircle2,
  ListOrdered,
  Workflow,
  X,
  FileText,
  Boxes,
  Zap,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';

interface ArchitectureViewProps {
  onClose: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'physics' | 'ai' | 'roadmap' | 'chapter_list'>('overview');

  const chapterSimulationsMasterList = [
    {
      module: 'Electrostatics',
      sims: [
        'Coulomb Law & Multi-point Charge Dynamics',
        'Electric Field Vector Field & Equipotential Surfaces',
        'Electric Dipole in Uniform & Non-uniform Field',
        'Gauss Law & Charged Sphere / Cylinder Flux Shells',
        'Parallel Plate & Spherical Capacitance with Dielectric Slabs'
      ]
    },
    {
      module: 'Mechanics & Kinematics',
      sims: [
        '2D Projectile Motion with Quadratic Air Drag',
        'Relative Motion & River-Boat / Rain-Man Vector Navigation',
        'Newton Laws & Inclined Plane Friction Blocks',
        '1D & 2D Elastic / Inelastic Collisions with Restitution e',
        'Work-Energy Theorem & Variable Force Trajectories'
      ]
    },
    {
      module: 'Rotation & Rigid Body Dynamics',
      sims: [
        'Rolling Without Slipping on Inclined Plane',
        'Moment of Inertia Visualizer (Cylinder, Sphere, Ring, Disk)',
        'Conservation of Angular Momentum & Gyroscopic Precession',
        'Toppling vs Sliding Dynamics under External Force'
      ]
    },
    {
      module: 'Gravitation & Celestial Mechanics',
      sims: [
        'Kepler Laws & Elliptical Orbital Dynamics',
        'Gravitational Potential & Escape Velocity Simulator',
        'Geostationary Satellite Insertion & Parking Orbits'
      ]
    },
    {
      module: 'Oscillations & SHM',
      sims: [
        'Non-Linear Simple Pendulum & Phase Space Plot',
        'Mass-Spring System with Viscous Damping',
        'Forced Oscillations & Resonance Peak Curve',
        'Lissajous Figures from Orthogonal SHMs'
      ]
    },
    {
      module: 'Waves & Wave Optics',
      sims: [
        'Transverse Wave Propagation & Superposition Reflection',
        'Doppler Effect in Sound with Moving Source & Observer',
        'Young Double Slit Interference & Fringe Width Shift',
        'Single Slit Diffraction & Circular Aperture Intensity'
      ]
    },
    {
      module: 'Ray Optics',
      sims: [
        'Thin Lens & Curved Mirror Principal Ray Bench',
        'Prism Refraction, Minimum Deviation & Dispersion',
        'Total Internal Reflection & Optical Fiber Propagation',
        'Astronomical Telescope & Compound Microscope Optics'
      ]
    },
    {
      module: 'Magnetism & EMI',
      sims: [
        'Biot-Savart Law & Magnetic Field of Circular Loops',
        'Lorentz Force & Cyclotron Helical Particle Trajectories',
        'Faraday Law Solenoid Magnet Induction & Lenz Direction',
        'LCR Transient & AC Resonance Circuits'
      ]
    },
    {
      module: 'Thermodynamics & Kinetic Theory',
      sims: [
        'PV Diagram Process Simulator (Isothermal, Adiabatic, Isobaric)',
        'Carnot Heat Engine & Efficiency Cycle',
        'Maxwell-Boltzmann Molecular Speed Distribution'
      ]
    },
    {
      module: 'Modern Physics',
      sims: [
        'Photoelectric Effect & Stopping Potential Curve',
        'Bohr Atomic Model Energy Levels & Spectral Lines',
        'Radioactive Decay Chain Exponential Half-life'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 overflow-y-auto p-6 text-slate-200 select-none">
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">JEE Sandbox System Architecture & Roadmap</h2>
              <p className="text-xs text-slate-400">Desktop Tauri + Rust Core + React WebGL/Canvas Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Architecture & Stack', icon: Workflow },
            { id: 'tree', label: '2. Folder Structure', icon: Boxes },
            { id: 'physics', label: '3. Physics & GPU Engine', icon: Cpu },
            { id: 'ai', label: '4. AI Mentor System', icon: Sparkles },
            { id: 'roadmap', label: '5. Implementation Roadmap', icon: ListOrdered },
            { id: 'chapter_list', label: '6. All JEE Physics Sims', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 text-xs text-slate-300 space-y-6 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="font-bold text-white text-sm mb-1">Desktop Runtime</h4>
                  <p className="text-slate-400 text-xs">
                    Tauri + Rust native backend for cross-platform Linux (AppImage, Flatpak), Windows, macOS with zero electron bloat.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <Activity className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-white text-sm mb-1">Physics Core (Rust/TS)</h4>
                  <p className="text-slate-400 text-xs">
                    RK4/Verlet numerical integration engine running at 60+ FPS with vector calculus and differential equations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="font-bold text-white text-sm mb-1">AI Teacher Bridge</h4>
                  <p className="text-slate-400 text-xs">
                    Server endpoint using Gemini 3.6 Flash & configurable provider endpoints for Socratic physics tutoring.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 text-cyan-400">High Level Data Flow</h4>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-slate-300 text-[11px] overflow-x-auto">
                  [User Input / Sliders] ──► [React State Bus] ──► [Physics Engine (RK4/Verlet Math)] ──► [2D Canvas GPU Renderer (60 FPS)]<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──► [Live Formula Engine (Evaluated LaTeX)]<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──► [Real-Time Graph Plotter (Telemetry)]<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──► [AI Mentor Engine (Gemini Server API)]
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
              <div className="text-cyan-400 font-bold mb-2">// Proposed JEE Sandbox Open-Source Folder Hierarchy</div>
              <div>/src-tauri</div>
              <div>├── Cargo.toml</div>
              <div>├── src/main.rs             // Rust native engine & Tauri window manager</div>
              <div>/src</div>
              <div>├── engine/</div>
              <div>│   ├── physicsEngine.ts     // Mathematical solver (RK4, Electrostatics, Optics, Lorentz)</div>
              <div>│   └── canvasRenderer.ts    // GPU 2D Canvas pipeline & vector overlays</div>
              <div>├── types/</div>
              <div>│   └── physics.ts           // Global TypeScript types & simulation models</div>
              <div>├── data/</div>
              <div>│   └── simulationsData.ts   // Presets catalogue for all JEE Physics chapters</div>
              <div>├── components/</div>
              <div>│   ├── Navbar.tsx           // Header bar & mode switcher</div>
              <div>│   ├── Sidebar.tsx          // JEE Syllabus Explorer</div>
              <div>│   ├── SimulationCanvas.tsx // Interactive HUD canvas</div>
              <div>│   ├── ControlPanel.tsx     // Slider controls & variable inputs</div>
              <div>│   ├── FormulaEngine.tsx    // Dynamic live LaTeX evaluator</div>
              <div>│   ├── GraphEngine.tsx      // Canvas real-time graph plotter</div>
              <div>│   ├── ChallengePanel.tsx   // Gamified JEE problem verification</div>
              <div>│   ├── AITeacher.tsx        // AI Mentor drawer</div>
              <div>│   └── ArchitectureView.tsx // System architecture & documentation view</div>
              <div>└── server.ts                // Full-stack Express + Vite + Gemini API backend</div>
            </div>
          )}

          {activeTab === 'physics' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm text-cyan-400">Physics Engine & Numerical Integration</h4>
              <p className="text-slate-400">
                To ensure high precision for JEE Main & Advanced problems, simulations use <strong>Runge-Kutta 4th Order (RK4)</strong> for differential equations (pendulums, orbital mechanics, SHM) and exact field integrals for electrostatics and magnetism.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-amber-400 block mb-1">Electrostatics Field & Potential</strong>
                  <div className="font-mono text-[11px] text-slate-300">
                    V = Σ (k q_i / r_i) / K<br/>
                    E = Σ (k q_i / r_i²) r_hat / K
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">Lorentz Force</strong>
                  <div className="font-mono text-[11px] text-slate-300">
                    F = q (E + v × B)<br/>
                    r_cyclotron = m v / (q B)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm text-cyan-400">Step-by-Step Implementation Roadmap</h4>
              <div className="space-y-3">
                {[
                  { phase: 'Phase 1: Core MVP (Current)', desc: 'Full 2D Canvas rendering engine, 6+ JEE chapters, live formula engine, real-time graph plotter, challenge verification, server-side Gemini AI teacher.' },
                  { phase: 'Phase 2: Full JEE Physics Catalogue', desc: 'Add remaining 15+ JEE Physics chapters (Thermodynamics processes, AC Circuits, Modern Physics, Fluid mechanics).' },
                  { phase: 'Phase 3: WebGL 3D Engine & Rust WASM Core', desc: 'Compile Rust physics core to WebAssembly for 120 FPS performance and 3D vector field rendering.' },
                  { phase: 'Phase 4: Multi-Subject Expansion (Chemistry & Math)', desc: 'Add 3D Molecular geometry, Titration curves, Calculus vector calculus visualizer.' },
                ].map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">{p.phase}</strong>
                      <span className="text-slate-400 text-xs">{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chapter_list' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm text-cyan-400">Master List of All JEE Physics Simulations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapterSimulationsMasterList.map((chap, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-amber-400 text-xs mb-2">{chap.module}</h5>
                    <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                      {chap.sims.map((sim, sIdx) => (
                        <li key={sIdx}>{sim}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

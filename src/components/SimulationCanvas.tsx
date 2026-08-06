import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Grid,
  Zap,
  Eye,
  Crosshair,
  Maximize2,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { Vector2D, SimulationPreset, ChargeObject, ParticleObject, OpticalObject, OpticalSource } from '../types/physics';
import { CanvasRenderer, RenderOptions } from '../engine/canvasRenderer';
import { PhysicsEngine, VectorMath } from '../engine/physicsEngine';

interface SimulationCanvasProps {
  preset: SimulationPreset;
  params: Record<string, number>;
  onProbeUpdate?: (data: { simX: number; simY: number; V: number; EMag: number }) => void;
  onSimTick?: (timeSec: number, simData: any) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  preset,
  params,
  onProbeUpdate,
  onSimTick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1.0);
  const [simTime, setSimTime] = useState(0);

  // Visual Overlays
  const [showGrid, setShowGrid] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [probePos, setProbePos] = useState<Vector2D | null>(null);

  // Physics Simulation Objects State
  const [charges, setCharges] = useState<ChargeObject[]>([]);
  const [particle, setParticle] = useState<ParticleObject | null>(null);
  const [opticalObj, setOpticalObj] = useState<OpticalObject | null>(null);
  const [opticalSrc, setOpticalSrc] = useState<OpticalSource | null>(null);
  const [pendulumState, setPendulumState] = useState<{ theta: number; omega: number }>({
    theta: (25 * Math.PI) / 180,
    omega: 0,
  });

  // Reset Scene Objects when Preset or Parameters change
  useEffect(() => {
    setSimTime(0);

    if (preset.id === 'electrostatics_charges') {
      const dist = params.dist || 2.5;
      const q1 = params.q1 !== undefined ? params.q1 : 4;
      const q2 = params.q2 !== undefined ? params.q2 : -4;

      setCharges([
        { id: 'c1', x: -dist / 2, y: 0, q: q1, radius: 18 },
        { id: 'c2', x: dist / 2, y: 0, q: q2, radius: 18 },
      ]);
    } else if (preset.id === 'projectile_motion') {
      const v0 = params.v0 || 30;
      const angle = params.angle || 45;
      const rad = (angle * Math.PI) / 180;

      setParticle({
        id: 'ball',
        x: 0,
        y: 0,
        vx: v0 * Math.cos(rad),
        vy: v0 * Math.sin(rad),
        m: 1,
        radius: 10,
        trail: [],
      });
    } else if (preset.id === 'ray_optics') {
      const f = params.focalLength || 15;
      const u = params.objectDist || -30;
      const h1 = params.objectHeight || 10;

      setOpticalObj({
        type: 'convex_lens',
        x: 0,
        focalLength: f,
      });

      setOpticalSrc({
        x: u,
        height: h1,
      });
    } else if (preset.id === 'shm_pendulum') {
      const angle = params.initialAngle || 25;
      setPendulumState({
        theta: (angle * Math.PI) / 180,
        omega: 0,
      });
    } else if (preset.id === 'lorentz_force') {
      const v = (params.particleSpeed || 5) * 10;
      setParticle({
        id: 'charge',
        x: -15,
        y: 0,
        vx: v,
        vy: 0,
        m: 1,
        radius: 8,
        trail: [],
      });
    } else if (preset.id === 'gravitation_orbits') {
      const r0 = params.orbitRadius || 120;
      const v0 = params.launchSpeed || 28;
      setParticle({
        id: 'satellite',
        x: r0,
        y: 0,
        vx: 0,
        vy: v0,
        m: 1,
        radius: 10,
        trail: [],
      });
    } else if (preset.id === 'rotation_rolling') {
      setParticle({
        id: 'body',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        m: params.mass || 2,
        radius: 20,
      });
    }
  }, [preset.id, params]);

  // Main Physics Simulation & Canvas Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const dtMs = now - lastTime;
      lastTime = now;
      const dtSec = Math.min(dtMs / 1000, 0.05) * timeScale;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure canvas fits container size
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear dark canvas
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Render Background Grid
      if (showGrid) {
        CanvasRenderer.drawGrid(ctx, width, height);
      }

      const opts: RenderOptions = {
        showGrid,
        showVectors,
        showFieldLines: true,
        showPotentialHeatmap: showHeatmap,
        showTrails,
        probePos,
        timeScale,
      };

      // Scene-Specific Physics Updates & Rendering
      if (preset.id === 'electrostatics_charges') {
        const dielectric = params.dielectric || 1;
        CanvasRenderer.renderElectrostatics(ctx, width, height, charges, dielectric, opts);

        if (probePos && onProbeUpdate) {
          const simX = (probePos.x - width / 2) / 50;
          const simY = -(probePos.y - height / 2) / 50;
          const V = PhysicsEngine.calcElectricPotential({ x: simX, y: simY }, charges, dielectric);
          const E = PhysicsEngine.calcElectricField({ x: simX, y: simY }, charges, dielectric);
          onProbeUpdate({ simX, simY, V, EMag: VectorMath.mag(E) });
        }
      } else if (preset.id === 'projectile_motion') {
        if (isPlaying && particle) {
          const g = params.g || 9.8;
          const airDrag = params.airDrag || 0;
          const updated = PhysicsEngine.updateProjectile(particle, dtSec, g, airDrag);

          // Stop at ground
          if (updated.y <= 0 && updated.vy < 0) {
            updated.y = 0;
            updated.vx = 0;
            updated.vy = 0;
          }
          setParticle(updated);
          setSimTime((t) => t + dtSec);
        }

        if (particle) {
          const v0 = params.v0 || 30;
          const angle = params.angle || 45;
          const g = params.g || 9.8;
          CanvasRenderer.renderProjectile(ctx, width, height, particle, v0, angle, g, opts);
        }
      } else if (preset.id === 'ray_optics') {
        if (opticalObj && opticalSrc) {
          CanvasRenderer.renderRayOptics(ctx, width, height, opticalObj, opticalSrc);
        }
      } else if (preset.id === 'shm_pendulum') {
        if (isPlaying) {
          const L = params.length || 1.5;
          const g = params.g || 9.8;
          const damping = params.damping || 0.05;
          const updated = PhysicsEngine.stepPendulum(
            pendulumState.theta,
            pendulumState.omega,
            L,
            g,
            damping,
            dtSec
          );
          setPendulumState(updated);
          setSimTime((t) => t + dtSec);
        }
        CanvasRenderer.renderPendulum(
          ctx,
          width,
          height,
          pendulumState.theta,
          pendulumState.omega,
          params.length || 1.5
        );
      } else if (preset.id === 'lorentz_force') {
        if (isPlaying && particle) {
          const q = (params.chargeQ || 2) * 1e-6;
          const B = params.bField || 2;
          const Ey = (params.eField || 0) * 1000;
          const updated = PhysicsEngine.stepLorentzParticle(
            particle,
            q,
            { x: 0, y: Ey },
            B,
            dtSec
          );
          setParticle(updated);
          setSimTime((t) => t + dtSec);
        }
        if (particle) {
          const center = { x: width / 2, y: height / 2 };
          const scale = 15;
          const px = center.x + particle.x * scale;
          const py = center.y - particle.y * scale;

          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.font = '14px sans-serif';
          for (let x = 40; x < width; x += 80) {
            for (let y = 40; y < height; y += 80) {
              ctx.fillText(params.bField >= 0 ? '⊗' : '⊙', x, y);
            }
          }

          if (particle.trail && particle.trail.length > 1) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            particle.trail.forEach((pt, idx) => {
              const tx = center.x + pt.x * scale;
              const ty = center.y - pt.y * scale;
              if (idx === 0) ctx.moveTo(tx, ty);
              else ctx.lineTo(tx, ty);
            });
            ctx.stroke();
          }

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (preset.id === 'electrostatics_dipole') {
        CanvasRenderer.renderElectricDipole(
          ctx,
          width,
          height,
          params.pMag || 5,
          params.angleDeg || 30,
          (params.eField || 10) * 1000
        );
      } else if (preset.id === 'electrostatics_gauss') {
        CanvasRenderer.renderGaussSphere(
          ctx,
          width,
          height,
          params.sphereRadius || 10,
          params.gaussianRadius || 15,
          params.totalCharge || 5,
          (params.isConducting ?? 1) === 1
        );
      } else if (preset.id === 'electrostatics_capacitor') {
        CanvasRenderer.renderParallelPlateCapacitor(
          ctx,
          width,
          height,
          params.areaCm2 || 100,
          params.distMm || 5,
          params.dielectricK || 3.0,
          params.voltage || 12,
          (params.isBatteryConnected ?? 1) === 1
        );
      } else if (preset.id === 'electrostatics_sandbox') {
        const dist = params.dist || 3.0;
        const q1 = params.q1 !== undefined ? params.q1 : 6;
        const q2 = params.q2 !== undefined ? params.q2 : -6;
        const sandboxCharges: ChargeObject[] = [
          { id: 'c1', x: -dist / 2, y: 0, q: q1, radius: 18 },
          { id: 'c2', x: dist / 2, y: 0, q: q2, radius: 18 },
        ];
        CanvasRenderer.renderElectrostatics(ctx, width, height, sandboxCharges, 1.0, opts);
      } else if (preset.id === 'thermodynamics_pv') {

        CanvasRenderer.renderPVDiagram(
          ctx,
          width,
          height,
          params.p1 || 4,
          params.v1 || 2,
          params.v2 || 6,
          params.gamma || 1.4
        );
      } else if (preset.id === 'gravitation_orbits') {
        if (isPlaying && particle) {
          const updated = PhysicsEngine.stepOrbitParticle(particle, params.centralMass || 100, 1000, dtSec);
          setParticle(updated);
          setSimTime((t) => t + dtSec);
        }
        if (particle) {
          CanvasRenderer.renderOrbitScene(ctx, width, height, particle, params.centralMass || 100, opts);
        }
      } else if (preset.id === 'circuits_rc') {
        if (isPlaying) {
          setSimTime((t) => t + dtSec);
        }
        const state = PhysicsEngine.calcRCCircuitState(
          simTime,
          params.vSource || 12,
          params.resistance || 10,
          params.capacitance || 100
        );
        CanvasRenderer.renderRCCircuit(
          ctx,
          width,
          height,
          params.vSource || 12,
          params.resistance || 10,
          params.capacitance || 100,
          state.vC,
          state.iCurrent
        );
      } else if (preset.id === 'rotation_rolling') {
        if (isPlaying) {
          setSimTime((t) => t + dtSec);
        }
        const rolling = PhysicsEngine.calcRollingIncline(
          params.mass || 2,
          params.radius || 0.5,
          params.inclineAngle || 30,
          'solid_sphere'
        );
        const dist = 0.5 * rolling.aLinear * simTime * simTime * 40;
        CanvasRenderer.renderRollingIncline(ctx, width, height, params.inclineAngle || 30, dist);
      } else if (preset.id === 'double_slit_interference') {
        // Draw Interference Fringes
        const wavelength = params.wavelength || 600;
        const d = params.slitSeparation || 0.5;
        const D = params.screenDist || 1.5;

        const screenX = width - 120;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX, 40);
        ctx.lineTo(screenX, height - 40);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px sans-serif';
        ctx.fillText(`Double Slits (d = ${d} mm)`, 80, height / 2 - 20);

        for (let y = 40; y < height - 40; y += 2) {
          const yCenter = y - height / 2;
          const calc = PhysicsEngine.calcDoubleSlitIntensity(yCenter / 100, d, D, wavelength);
          const alpha = Math.min(1, Math.max(0.05, calc.intensity / 4));
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.fillRect(screenX, y, 40, 2);
        }
      }


      // Notify parent for graph & challenge checks
      if (onSimTick) {
        onSimTick(simTime, {
          params,
          probePos,
          probeEMag: probePos ? PhysicsEngine.calcElectricField({ x: (probePos.x - width / 2) / 50, y: -(probePos.y - height / 2) / 50 }, charges, params.dielectric || 1).x : 0,
          particle,
          pendulumState,
        });
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeScale, preset.id, params, charges, particle, opticalObj, opticalSrc, pendulumState, probePos, showGrid, showVectors, showHeatmap, showTrails, simTime]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setProbePos({ x, y });
  };

  const handleReset = () => {
    setSimTime(0);
    setIsPlaying(true);
    setProbePos(null);
  };

  return (
    <div ref={containerRef} className="relative flex-1 bg-slate-950 h-full overflow-hidden select-none flex flex-col">
      {/* 2D GPU Render Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setProbePos(null)}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating HUD Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xl z-10 text-slate-200">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isPlaying ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
          }`}
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        {/* Time Scale Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
          >
            <option value={0.25}>0.25x Slow</option>
            <option value={0.5}>0.5x</option>
            <option value={1.0}>1.0x Normal</option>
            <option value={2.0}>2.0x Fast</option>
            <option value={5.0}>5.0x Turbo</option>
          </select>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Overlays Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              showGrid ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              showVectors ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Vector Overlay"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              showHeatmap ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Potential Heatmap"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Time Elapsed Readout */}
        <div className="ml-2 px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 font-mono text-xs border border-slate-800">
          t = {simTime.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};

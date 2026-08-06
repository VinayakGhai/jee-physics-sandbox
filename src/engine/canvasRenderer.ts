import { Vector2D, ChargeObject, ParticleObject, OpticalObject, OpticalSource } from '../types/physics';
import { PhysicsEngine, VectorMath } from './physicsEngine';

export interface RenderOptions {
  showGrid: boolean;
  showVectors: boolean;
  showFieldLines: boolean;
  showPotentialHeatmap: boolean;
  showTrails: boolean;
  probePos: Vector2D | null;
  timeScale: number;
}

export class CanvasRenderer {
  static drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number = 40,
    offset: Vector2D = { x: width / 2, y: height / 2 }
  ) {
    ctx.strokeStyle = '#1e293b'; // dark slate grid
    ctx.lineWidth = 1;

    const startX = (offset.x % scale) - scale;
    for (let x = startX; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const startY = (offset.y % scale) - scale;
    for (let y = startY; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Origin Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, offset.y);
    ctx.lineTo(width, offset.y);
    ctx.moveTo(offset.x, 0);
    ctx.lineTo(offset.x, height);
    ctx.stroke();
  }

  static drawArrow(
    ctx: CanvasRenderingContext2D,
    from: Vector2D,
    to: Vector2D,
    color: string = '#38bdf8',
    lineWidth: number = 2,
    headLen: number = 8
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag < 1) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLen * Math.cos(angle - Math.PI / 6),
      to.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLen * Math.cos(angle + Math.PI / 6),
      to.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- ELECTROSTATICS SCENE ---
  static renderElectrostatics(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    charges: ChargeObject[],
    dielectric: number,
    opts: RenderOptions
  ) {
    const center = { x: width / 2, y: height / 2 };
    const scale = 50; // 50 pixels = 1 meter

    // 1. Heatmap
    if (opts.showPotentialHeatmap && charges.length > 0) {
      const step = 8;
      for (let px = 0; px < width; px += step) {
        for (let py = 0; py < height; py += step) {
          const simX = (px - center.x) / scale;
          const simY = -(py - center.y) / scale;
          const V = PhysicsEngine.calcElectricPotential({ x: simX, y: simY }, charges, dielectric);
          
          const normV = Math.max(-1, Math.min(1, V / 50000));
          if (normV > 0) {
            ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(0.4, normV * 0.5)})`; // Red for positive
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${Math.min(0.4, Math.abs(normV) * 0.5)})`; // Blue for negative
          }
          ctx.fillRect(px, py, step, step);
        }
      }
    }

    // 2. Field Vectors
    if (opts.showVectors && charges.length > 0) {
      const gridStep = 40;
      for (let px = 20; px < width; px += gridStep) {
        for (let py = 20; py < height; py += gridStep) {
          const simX = (px - center.x) / scale;
          const simY = -(py - center.y) / scale;
          const E = PhysicsEngine.calcElectricField({ x: simX, y: simY }, charges, dielectric);
          const EMag = VectorMath.mag(E);

          if (EMag > 100) {
            const arrowLen = Math.min(24, Math.max(8, Math.log10(EMag) * 5));
            const angle = Math.atan2(-E.y, E.x);
            const to = {
              x: px + arrowLen * Math.cos(angle),
              y: py + arrowLen * Math.sin(angle),
            };
            const opacity = Math.min(0.9, EMag / 20000);
            CanvasRenderer.drawArrow(ctx, { x: px, y: py }, to, `rgba(56, 189, 248, ${opacity})`, 1.5, 6);
          }
        }
      }
    }

    // 3. Draw Charges
    for (const ch of charges) {
      const px = center.x + ch.x * scale;
      const py = center.y - ch.y * scale;

      // Glow halo
      const glowGrad = ctx.createRadialGradient(px, py, 5, px, py, ch.radius * 2.5);
      const isPos = ch.q >= 0;
      const colorHex = isPos ? '#ef4444' : '#3b82f6';
      glowGrad.addColorStop(0, colorHex);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(px, py, ch.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Main Circle
      ctx.fillStyle = colorHex;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, ch.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Symbol (+ or -) and value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${ch.q > 0 ? '+' : ''}${ch.q}µC`, px, py);
    }

    // 4. Interactive Probe Tool
    if (opts.probePos) {
      const px = opts.probePos.x;
      const py = opts.probePos.y;
      const simX = (px - center.x) / scale;
      const simY = -(py - center.y) / scale;

      const V = PhysicsEngine.calcElectricPotential({ x: simX, y: simY }, charges, dielectric);
      const E = PhysicsEngine.calcElectricField({ x: simX, y: simY }, charges, dielectric);
      const EMag = VectorMath.mag(E);

      // Probe crosshair
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.moveTo(px - 14, py); ctx.lineTo(px + 14, py);
      ctx.moveTo(px, py - 14); ctx.lineTo(px, py + 14);
      ctx.stroke();

      // Readout Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.roundRect(px + 12, py - 40, 160, 65, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Pos: (${simX.toFixed(2)}, ${simY.toFixed(2)}) m`, px + 20, py - 24);
      ctx.fillText(`V  : ${(V / 1000).toFixed(2)} kV`, px + 20, py - 10);
      ctx.fillText(`|E|: ${(EMag / 1000).toFixed(2)} kN/C`, px + 20, py + 4);
    }
  }

  // --- PROJECTILE SCENE ---
  static renderProjectile(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p: ParticleObject,
    v0: number,
    angleDeg: number,
    g: number,
    opts: RenderOptions
  ) {
    const groundY = height - 80;
    const launchX = 80;
    const scale = 12; // 12 pixels per meter

    // Ground line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Grass/Ground hatch
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY, width, height - groundY);

    // Theoretical Trajectory Parabola (No Drag)
    const angleRad = (angleDeg * Math.PI) / 180;
    const vx0 = v0 * Math.cos(angleRad);
    const vy0 = v0 * Math.sin(angleRad);
    const maxH = (vy0 * vy0) / (2 * g);
    const range = (v0 * v0 * Math.sin(2 * angleRad)) / g;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let xM = 0; xM <= range; xM += 0.5) {
      const t = xM / vx0;
      const yM = vy0 * t - 0.5 * g * t * t;
      const px = launchX + xM * scale;
      const py = groundY - yM * scale;
      if (xM === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual Particle Trail
    if (opts.showTrails && p.trail && p.trail.length > 1) {
      ctx.strokeStyle = '#22c55e'; // Green trail
      ctx.lineWidth = 3;
      ctx.beginPath();
      p.trail.forEach((pt, idx) => {
        const px = launchX + pt.x * scale;
        const py = groundY - pt.y * scale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Current Ball Position
    const ballPx = launchX + p.x * scale;
    const ballPy = groundY - p.y * scale;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ballPx, ballPy, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Velocity Vectors
    if (opts.showVectors) {
      // Vx vector
      CanvasRenderer.drawArrow(
        ctx,
        { x: ballPx, y: ballPy },
        { x: ballPx + p.vx * 1.5, y: ballPy },
        '#38bdf8',
        2,
        6
      );
      // Vy vector
      CanvasRenderer.drawArrow(
        ctx,
        { x: ballPx, y: ballPy },
        { x: ballPx, y: ballPy - p.vy * 1.5 },
        '#f43f5e',
        2,
        6
      );
      // Total V
      CanvasRenderer.drawArrow(
        ctx,
        { x: ballPx, y: ballPy },
        { x: ballPx + p.vx * 1.5, y: ballPy - p.vy * 1.5 },
        '#a855f7',
        2.5,
        7
      );
    }

    // Key Markers (Max Height & Range)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`H_max: ${maxH.toFixed(1)} m`, launchX + (range * scale) / 2, groundY - maxH * scale - 15);
    ctx.fillText(`Range: ${range.toFixed(1)} m`, launchX + range * scale, groundY + 20);
  }

  // --- RAY OPTICS SCENE ---
  static renderRayOptics(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    optics: OpticalObject,
    source: OpticalSource
  ) {
    const centerY = height / 2;
    const lensX = width / 2;
    const scale = 3; // 3 pixels per cm

    // Optical Axis
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lens / Mirror Center Position
    const optX = lensX + optics.x * scale;
    const f = optics.focalLength;
    const fPx = f * scale;

    // Draw Focus Points F1, F2, 2F1, 2F2
    const points = [
      { name: 'F1', x: optX - fPx },
      { name: '2F1', x: optX - 2 * fPx },
      { name: 'F2', x: optX + fPx },
      { name: '2F2', x: optX + 2 * fPx },
    ];
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(pt.name, pt.x, centerY + 18);
    }

    // Lens Geometry Outline
    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 3;

    if (optics.type === 'convex_lens') {
      ctx.beginPath();
      ctx.ellipse(optX, centerY, 16, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (optics.type === 'concave_lens') {
      ctx.beginPath();
      ctx.moveTo(optX - 14, centerY - 110);
      ctx.lineTo(optX + 14, centerY - 110);
      ctx.quadraticCurveTo(optX + 4, centerY, optX + 14, centerY + 110);
      ctx.lineTo(optX - 14, centerY + 110);
      ctx.quadraticCurveTo(optX - 4, centerY, optX - 14, centerY - 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Object Arrow
    const objX = optX + source.x * scale;
    const objY = centerY - source.height * scale;

    CanvasRenderer.drawArrow(ctx, { x: objX, y: centerY }, { x: objX, y: objY }, '#22c55e', 3, 10);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Object', objX, centerY + 24);

    // Ray Optics Physics Tracing
    const calc = PhysicsEngine.calcRayOptics(optics, source);

    if (isFinite(calc.imageX)) {
      const imgPx = optX + calc.v * scale;
      const imgPy = centerY - calc.h2 * scale;

      // Image Arrow
      const imgColor = calc.isReal ? '#ef4444' : '#a855f7';
      CanvasRenderer.drawArrow(ctx, { x: imgPx, y: centerY }, { x: imgPx, y: imgPy }, imgColor, 3, 10);
      ctx.fillStyle = imgColor;
      ctx.fillText(calc.isReal ? 'Real Image' : 'Virtual Image', imgPx, centerY - (calc.h2 > 0 ? calc.h2 * scale + 15 : calc.h2 * scale - 15));

      // Rays
      // Ray 1: Parallel to Axis -> Focus
      ctx.strokeStyle = '#38bdf8'; // Cyan
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(optX, objY);
      ctx.lineTo(imgPx, imgPy);
      ctx.stroke();

      // Ray 2: Through Optical Center
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(imgPx, imgPy);
      ctx.stroke();

      // Virtual extension rays if virtual image
      if (!calc.isReal) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(optX, objY);
        ctx.lineTo(imgPx, imgPy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // --- SHM PENDULUM SCENE ---
  static renderPendulum(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theta: number,
    omega: number,
    lengthM: number
  ) {
    const pivot = { x: width / 2, y: 80 };
    const scale = 140; // 140 px per meter
    const bobL = lengthM * scale;

    const bobX = pivot.x + bobL * Math.sin(theta);
    const bobY = pivot.y + bobL * Math.cos(theta);

    // Pivot Stand
    ctx.fillStyle = '#475569';
    ctx.fillRect(pivot.x - 40, pivot.y - 12, 80, 12);

    // String
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Arc indicator for angle theta
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 40, Math.PI / 2, Math.PI / 2 + theta, theta < 0);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px monospace';
    ctx.fillText(`θ = ${((theta * 180) / Math.PI).toFixed(1)}°`, pivot.x + 48 * Math.sin(theta / 2), pivot.y + 50);
  }

  // --- ELECTRIC DIPOLE IN UNIFORM FIELD SCENE ---
  static renderElectricDipole(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pMag: number,
    angleDeg: number,
    eFieldMag: number
  ) {
    const center = { x: width / 2, y: height / 2 };
    const rad = (angleDeg * Math.PI) / 180;
    const len = 70; // dipole length

    // Draw Background Uniform E-field Arrows
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    for (let y = 60; y < height - 40; y += 60) {
      CanvasRenderer.drawArrow(ctx, { x: 50, y }, { x: width - 50, y }, 'rgba(56, 189, 248, 0.3)', 1.5, 6);
    }

    // Dipole Charges (-q on left, +q on right relative to angle)
    const q1Pos = { x: center.x - (len / 2) * Math.cos(rad), y: center.y - (len / 2) * Math.sin(rad) };
    const q2Pos = { x: center.x + (len / 2) * Math.cos(rad), y: center.y + (len / 2) * Math.sin(rad) };

    // Rigid Rod
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(q1Pos.x, q1Pos.y);
    ctx.lineTo(q2Pos.x, q2Pos.y);
    ctx.stroke();

    // -q Charge
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(q1Pos.x, q1Pos.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('-', q1Pos.x - 4, q1Pos.y + 5);

    // +q Charge
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(q2Pos.x, q2Pos.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('+', q2Pos.x - 4, q2Pos.y + 5);

    // Dipole Vector Arrow p (points from -q to +q)
    CanvasRenderer.drawArrow(ctx, q1Pos, q2Pos, '#f59e0b', 3, 10);

    // Torque Arc Indicator
    const torque = pMag * eFieldMag * Math.sin(rad);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 45, 0, rad, false);
    ctx.stroke();
    ctx.fillStyle = '#a855f7';
    ctx.font = '12px monospace';
    ctx.fillText(`τ = ${torque.toFixed(2)} N·m`, center.x + 50, center.y - 20);
  }

  // --- GAUSS LAW SPHERICAL DISTRIBUTION SCENE ---
  static renderGaussSphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    sphereRadius: number,
    gaussianRadius: number,
    totalCharge: number,
    isConducting: boolean
  ) {
    const center = { x: width / 2, y: height / 2 };
    const rPixel = sphereRadius * 3;
    const gPixel = gaussianRadius * 3;

    // Solid Sphere Body
    const gradient = ctx.createRadialGradient(center.x, center.y, 5, center.x, center.y, rPixel);
    if (isConducting) {
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.9, '#334155');
      gradient.addColorStop(1, '#ef4444'); // Charge on surface
    } else {
      gradient.addColorStop(0, '#f87171'); // Uniform charge throughout
      gradient.addColorStop(1, '#dc2626');
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, rPixel, 0, Math.PI * 2);
    ctx.fill();

    // Gaussian Surface (Dashed Circle)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, gPixel, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Surface Label
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.fillText(`Gaussian Surface (r = ${gaussianRadius}m)`, center.x + gPixel + 10, center.y);

    // Live E(r) Curve Inset Graph (Bottom Left)
    const graphOrigin = { x: 50, y: height - 40 };
    const graphW = 200;
    const graphH = 100;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(graphOrigin.x - 10, graphOrigin.y - graphH - 10, graphW + 20, graphH + 25);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphOrigin.x - 10, graphOrigin.y - graphH - 10, graphW + 20, graphH + 25);

    // Axes for E(r)
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(graphOrigin.x, graphOrigin.y - graphH);
    ctx.lineTo(graphOrigin.x, graphOrigin.y);
    ctx.lineTo(graphOrigin.x + graphW, graphOrigin.y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('E(r)', graphOrigin.x - 5, graphOrigin.y - graphH - 2);
    ctx.fillText('r', graphOrigin.x + graphW + 2, graphOrigin.y + 4);

    // Draw E(r) Curve
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const R_norm = (sphereRadius / 50) * graphW;
    for (let x = 0; x <= graphW; x++) {
      const rVal = (x / graphW) * 50; // map x to r
      let eVal = 0;
      if (rVal <= sphereRadius) {
        eVal = isConducting ? 0 : (rVal / sphereRadius) * (graphH - 20);
      } else {
        eVal = Math.pow(sphereRadius / rVal, 2) * (graphH - 20);
      }
      const py = graphOrigin.y - eVal;
      if (x === 0) ctx.moveTo(graphOrigin.x + x, py);
      else ctx.lineTo(graphOrigin.x + x, py);
    }
    ctx.stroke();
  }

  // --- PARALLEL PLATE CAPACITOR & DIELECTRIC SCENE ---
  static renderParallelPlateCapacitor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    areaCm2: number,
    distMm: number,
    dielectricK: number,
    voltage: number,
    isBatteryConnected: boolean
  ) {
    const center = { x: width / 2, y: height / 2 };
    const plateW = Math.min(300, areaCm2 * 2.5);
    const plateH = 16;
    const gapH = Math.max(50, distMm * 15);

    const topPlateY = center.y - gapH / 2 - plateH;
    const bottomPlateY = center.y + gapH / 2;

    // Top Plate (+)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(center.x - plateW / 2, topPlateY, plateW, plateH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('+ + + + + Positive Plate (+Q) + + + + +', center.x - 110, topPlateY + 12);

    // Bottom Plate (-)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(center.x - plateW / 2, bottomPlateY, plateW, plateH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('- - - - - Negative Plate (-Q) - - - - -', center.x - 110, bottomPlateY + 12);

    // Dielectric Slab (Slab inserted between plates)
    if (dielectricK > 1.0) {
      const slabW = plateW * 0.7;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.fillRect(center.x - plateW / 2 + 20, topPlateY + plateH, slabW, gapH);
      ctx.strokeRect(center.x - plateW / 2 + 20, topPlateY + plateH, slabW, gapH);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Dielectric Slab (K = ${dielectricK})`, center.x - plateW / 2 + 30, center.y + 4);
    }

    // E-field Arrows between plates
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1.5;
    for (let x = center.x - plateW / 2 + 20; x <= center.x + plateW / 2 - 20; x += 30) {
      CanvasRenderer.drawArrow(
        ctx,
        { x, y: topPlateY + plateH + 4 },
        { x, y: bottomPlateY - 4 },
        'rgba(245, 158, 11, 0.6)',
        1.5,
        5
      );
    }

    // Battery / Disconnected Status Icon
    ctx.fillStyle = isBatteryConnected ? '#22c55e' : '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(
      isBatteryConnected ? '⚡ Battery Connected (V Constant)' : '🔋 Battery Disconnected (Q Constant)',
      50,
      50
    );
  }


  // --- THERMODYNAMICS PV INDICATOR DIAGRAM ---
  static renderPVDiagram(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p1: number,
    v1: number,
    v2: number,
    gamma: number
  ) {
    const margin = 80;
    const origin = { x: margin, y: height - margin };
    const graphWidth = width - margin * 2;
    const graphHeight = height - margin * 2;

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x, margin);
    ctx.lineTo(origin.x, origin.y);
    ctx.lineTo(width - margin, origin.y);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Volume V (L)', width / 2, height - 25);
    ctx.save();
    ctx.translate(30, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Pressure P (atm)', 0, 0);
    ctx.restore();

    // Map function
    const maxV = Math.max(10, v2 + 1);
    const maxP = Math.max(10, p1 + 1);
    const mapVToX = (v: number) => origin.x + (v / maxV) * graphWidth;
    const mapPToY = (p: number) => origin.y - (p / maxP) * graphHeight;

    // Draw Isothermal PV Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const stepCount = 50;
    for (let i = 0; i <= stepCount; i++) {
      const v = v1 + (i / stepCount) * (v2 - v1);
      const p = p1 * (v1 / v);
      const x = mapVToX(v);
      const y = mapPToY(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill Work Area
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.moveTo(mapVToX(v1), origin.y);
    for (let i = 0; i <= stepCount; i++) {
      const v = v1 + (i / stepCount) * (v2 - v1);
      const p = p1 * (v1 / v);
      ctx.lineTo(mapVToX(v), mapPToY(p));
    }
    ctx.lineTo(mapVToX(v2), origin.y);
    ctx.closePath();
    ctx.fill();

    // Start (P1, V1) and End (P2, V2) Nodes
    const p2Iso = p1 * (v1 / v2);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(mapVToX(v1), mapPToY(p1), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`State 1 (${v1}L, ${p1}atm)`, mapVToX(v1) + 10, mapPToY(p1) - 10);

    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(mapVToX(v2), mapPToY(p2Iso), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`State 2 (${v2}L, ${p2Iso.toFixed(2)}atm)`, mapVToX(v2) + 10, mapPToY(p2Iso) - 10);
  }

  // --- GRAVITATION & SATELLITE ORBIT SCENE ---
  static renderOrbitScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    particle: ParticleObject,
    centralMass: number,
    options?: RenderOptions
  ) {
    const center = { x: width / 2, y: height / 2 };

    // Star / Central Gravitational Mass
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Orbit Trail
    if (options?.showTrails !== false && particle.trail && particle.trail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      particle.trail.forEach((pt, idx) => {
        const x = center.x + pt.x;
        const y = center.y + pt.y;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Satellite Particle
    const satX = center.x + particle.x;
    const satY = center.y + particle.y;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(satX, satY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Velocity Vector
    if (options?.showVectors) {
      CanvasRenderer.drawArrow(
        ctx,
        { x: satX, y: satY },
        { x: satX + particle.vx * 3, y: satY + particle.vy * 3 },
        "#34d399",
        2
      );
    }
  }

  // --- RC TRANSIENT CIRCUIT SCHEMATIC ---
  static renderRCCircuit(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    v0: number,
    r: number,
    c: number,
    vc: number,
    iCurrent: number
  ) {
    const margin = 100;
    const rectW = width - margin * 2;
    const rectH = height - margin * 2;
    const left = margin;
    const top = margin;
    const right = left + rectW;
    const bottom = top + rectH;

    // Wires
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(left, top, rectW, rectH);
    ctx.stroke();

    // DC Power Supply (Left side)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(left - 20, top + rectH / 2 - 30, 40, 60);
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(left - 15, top + rectH / 2 - 10);
    ctx.lineTo(left + 15, top + rectH / 2 - 10);
    ctx.moveTo(left - 8, top + rectH / 2 + 10);
    ctx.lineTo(left + 8, top + rectH / 2 + 10);
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.font = '14px sans-serif';
    ctx.fillText(`DC Source ${v0}V`, left - 90, top + rectH / 2 + 5);

    // Resistor (Top side)
    ctx.fillStyle = '#334155';
    ctx.fillRect(left + rectW / 2 - 40, top - 15, 80, 30);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Resistor R = ${r} kΩ`, left + rectW / 2 - 45, top - 25);

    // Capacitor (Right side)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(right - 15, top + rectH / 2 - 30, 30, 60);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(right - 15, top + rectH / 2 - 15);
    ctx.lineTo(right + 15, top + rectH / 2 - 15);
    ctx.moveTo(right - 15, top + rectH / 2 + 15);
    ctx.lineTo(right + 15, top + rectH / 2 + 15);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Capacitor C = ${c} µF`, right + 30, top + rectH / 2 - 5);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`V_c = ${vc.toFixed(2)} V`, right + 30, top + rectH / 2 + 18);
  }

  // --- ROTATIONAL MOTION ON INCLINE ---
  static renderRollingIncline(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    angleDeg: number,
    posY: number
  ) {
    const rad = (angleDeg * Math.PI) / 180;
    const baseW = width * 0.7;
    const baseH = baseW * Math.tan(rad);
    const startX = 80;
    const startY = height - 100;

    // Wedge
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + baseW, startY);
    ctx.lineTo(startX, startY - Math.min(baseH, height - 160));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rolling Sphere / Disk
    const dist = Math.min(posY, baseW - 40);
    const diskX = startX + dist * Math.cos(rad);
    const diskY = (startY - Math.min(baseH, height - 160)) + dist * Math.sin(rad) - 24;

    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diskX, diskY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotation indicator line
    const rotAngle = dist / 22;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(diskX, diskY);
    ctx.lineTo(diskX + 22 * Math.cos(rotAngle), diskY + 22 * Math.sin(rotAngle));
    ctx.stroke();
  }
}


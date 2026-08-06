import { Vector2D, ChargeObject, ParticleObject, OpticalObject, OpticalSource } from '../types/physics';

export const K_ELECTROSTATIC = 8.98755e9; // N m^2 / C^2

export class VectorMath {
  static add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static sub(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static scale(v: Vector2D, s: number): Vector2D {
    return { x: v.x * s, y: v.y * s };
  }

  static mag(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static norm(v: Vector2D): Vector2D {
    const m = VectorMath.mag(v);
    if (m === 0) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  }

  static dist(a: Vector2D, b: Vector2D): number {
    return VectorMath.mag(VectorMath.sub(a, b));
  }
}

export class PhysicsEngine {
  // --- ELECTROSTATICS ---
  static calcElectricPotential(pos: Vector2D, charges: ChargeObject[], dielectric: number = 1): number {
    let V = 0;
    const kEff = (9.0e9) / dielectric; // Effective electrostatic constant in simulation scale
    for (const ch of charges) {
      const r = VectorMath.dist(pos, { x: ch.x, y: ch.y });
      if (r > 0.05) {
        // ch.q in microCoulombs
        V += (kEff * (ch.q * 1e-6)) / r;
      }
    }
    return V;
  }

  static calcElectricField(pos: Vector2D, charges: ChargeObject[], dielectric: number = 1): Vector2D {
    let Ex = 0;
    let Ey = 0;
    const kEff = (9.0e9) / dielectric;
    for (const ch of charges) {
      const dx = pos.x - ch.x;
      const dy = pos.y - ch.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      if (r > 0.1) {
        const EMag = (kEff * Math.abs(ch.q * 1e-6)) / r2;
        const sign = ch.q > 0 ? 1 : -1;
        Ex += EMag * (dx / r) * sign;
        Ey += EMag * (dy / r) * sign;
      }
    }
    return { x: Ex, y: Ey };
  }

  static calcCoulombForce(ch1: ChargeObject, ch2: ChargeObject, dielectric: number = 1): number {
    const r = VectorMath.dist({ x: ch1.x, y: ch1.y }, { x: ch2.x, y: ch2.y });
    if (r <= 0) return 0;
    const kEff = 9.0e9 / dielectric;
    return (kEff * Math.abs(ch1.q * 1e-6 * ch2.q * 1e-6)) / (r * r);
  }

  // --- ELECTRIC DIPOLE DYNAMICS ---
  static calcDipoleState(pMagnitude: number, eFieldMagnitude: number, angleDeg: number, momentOfInertia: number = 0.1) {
    const rad = (angleDeg * Math.PI) / 180;
    const torque = pMagnitude * eFieldMagnitude * Math.sin(rad);
    const potentialEnergy = -pMagnitude * eFieldMagnitude * Math.cos(rad);
    const shmPeriod = 2 * Math.PI * Math.sqrt(momentOfInertia / (pMagnitude * eFieldMagnitude));

    // Field at distance r on axis and equator
    const calcFieldsAtDist = (r: number) => {
      const k = 9.0e9;
      const eAxial = (2 * k * pMagnitude * 1e-9) / Math.pow(r, 3);
      const eEquatorial = (k * pMagnitude * 1e-9) / Math.pow(r, 3);
      return { eAxial, eEquatorial };
    };

    return { torque, potentialEnergy, shmPeriod, calcFieldsAtDist };
  }

  // --- GAUSS LAW & CHARGE DISTRIBUTIONS ---
  static calcGaussSphereFieldAndPotential(
    r: number, // Radial distance from center (m)
    R: number, // Radius of sphere (m)
    totalQ: number, // Total Charge (µC)
    isConducting: boolean = true
  ) {
    const k = 9.0e9;
    const qC = totalQ * 1e-6;
    let E = 0;
    let V = 0;

    if (r <= R) {
      if (isConducting) {
        E = 0;
        V = (k * qC) / R;
      } else {
        // Non-conducting sphere: E inside = k * Q * r / R^3
        E = (k * qC * r) / (R * R * R);
        V = ((k * qC) / (2 * R * R * R)) * (3 * R * R - r * r);
      }
    } else {
      // Outside sphere (r > R) for both conducting & non-conducting
      E = (k * qC) / (r * r);
      V = (k * qC) / r;
    }

    return { E, V };
  }

  static calcGaussLineAndSheetField(r: number, lambda: number, sigma: number) {
    const eps0 = 8.854e-12;
    const eLine = (lambda * 1e-6) / (2 * Math.PI * eps0 * r);
    const eSheet = (sigma * 1e-6) / (2 * eps0);
    return { eLine, eSheet };
  }

  // --- CAPACITORS & DIELECTRICS ---
  static calcCapacitorState(
    areaCm2: number,
    distMm: number,
    dielectricK: number,
    voltage: number,
    isBatteryConnected: boolean = true
  ) {
    const eps0 = 8.854e-12;
    const areaM2 = areaCm2 * 1e-4;
    const distM = distMm * 1e-3;

    const C0 = (eps0 * areaM2) / distM; // Vacuum capacitance
    const C = dielectricK * C0;         // Capacitance with dielectric K

    let V = voltage;
    let Q = 0;

    if (isBatteryConnected) {
      V = voltage;
      Q = C * V;
    } else {
      // Battery disconnected => Q constant (equal to vacuum Q0)
      const Q0 = C0 * voltage;
      Q = Q0;
      V = Q / C;
    }

    const EField = V / distM;
    const storedEnergy = 0.5 * C * V * V;
    const energyDensity = 0.5 * eps0 * dielectricK * EField * EField;
    const forcePlates = (Q * Q) / (2 * dielectricK * eps0 * areaM2);

    return { C, C0, V, Q, EField, storedEnergy, energyDensity, forcePlates };
  }

  // --- PROJECTILE MOTION ---

  static updateProjectile(
    p: ParticleObject,
    dt: number,
    g: number = 9.8,
    airDragCoeff: number = 0
  ): ParticleObject {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const dragX = -0.5 * airDragCoeff * p.vx * speed;
    const dragY = -0.5 * airDragCoeff * p.vy * speed;

    const ax = dragX / p.m;
    const ay = -g + (dragY / p.m);

    const newVx = p.vx + ax * dt;
    const newVy = p.vy + ay * dt;
    const newX = p.x + newVx * dt;
    const newY = p.y + newVy * dt;

    const newTrail = [...(p.trail || []), { x: newX, y: newY }];
    if (newTrail.length > 200) newTrail.shift();

    return {
      ...p,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      trail: newTrail,
    };
  }

  // --- RAY OPTICS CALCULATIONS ---
  static calcRayOptics(optics: OpticalObject, source: OpticalSource) {
    // Cartesian convention: source at x < 0 relative to optic
    const u = source.x - optics.x; // negative number
    const f = optics.focalLength;
    const h1 = source.height;

    let v = 0;
    let m = 0;
    let h2 = 0;
    let isReal = true;

    if (optics.type === 'convex_lens') {
      // 1/v - 1/u = 1/f => 1/v = 1/f + 1/u
      // f > 0
      const invV = (1 / f) + (1 / u);
      if (Math.abs(invV) < 1e-6) {
        v = Infinity; // image at infinity
        m = Infinity;
      } else {
        v = 1 / invV;
        m = v / u;
        isReal = v > 0;
      }
    } else if (optics.type === 'concave_lens') {
      // f is negative for concave lens
      const fConcave = -Math.abs(f);
      const invV = (1 / fConcave) + (1 / u);
      v = 1 / invV;
      m = v / u;
      isReal = false;
    } else if (optics.type === 'concave_mirror') {
      // 1/v + 1/u = 1/f (f negative for concave mirror in Cartesian)
      const fMirror = -Math.abs(f);
      const invV = (1 / fMirror) - (1 / u);
      v = 1 / invV;
      m = -v / u;
      isReal = v < 0;
    } else if (optics.type === 'convex_mirror') {
      const fMirror = Math.abs(f);
      const invV = (1 / fMirror) - (1 / u);
      v = 1 / invV;
      m = -v / u;
      isReal = false;
    }

    h2 = m * h1;
    const imageX = optics.x + (isFinite(v) ? v : 1000);

    return {
      u,
      v,
      m,
      h1,
      h2,
      isReal,
      imageX,
      imageY: h2,
    };
  }

  // --- SHM & OSCILLATIONS ---
  static stepPendulum(
    theta: number,
    omega: number,
    length: number,
    g: number,
    damping: number,
    dt: number
  ): { theta: number; omega: number } {
    // RK4 integration for d^2 theta / dt^2 = -(g/L) sin(theta) - damping * omega
    const accel = (th: number, om: number) => -(g / length) * Math.sin(th) - damping * om;

    const k1_th = omega;
    const k1_om = accel(theta, omega);

    const k2_th = omega + 0.5 * dt * k1_om;
    const k2_om = accel(theta + 0.5 * dt * k1_th, omega + 0.5 * dt * k1_om);

    const k3_th = omega + 0.5 * dt * k2_om;
    const k3_om = accel(theta + 0.5 * dt * k2_th, omega + 0.5 * dt * k2_om);

    const k4_th = omega + dt * k3_om;
    const k4_om = accel(theta + dt * k3_th, omega + dt * k3_om);

    const newTheta = theta + (dt / 6) * (k1_th + 2 * k2_th + 2 * k3_th + k4_th);
    const newOmega = omega + (dt / 6) * (k1_om + 2 * k2_om + 2 * k3_om + k4_om);

    return { theta: newTheta, omega: newOmega };
  }

  // --- LORENTZ FORCE (MAGNETISM) ---
  static stepLorentzParticle(
    p: ParticleObject,
    q: number,
    E: Vector2D,
    B: number, // Magnetic field along z
    dt: number
  ): ParticleObject {
    // F = q(E + v x B)
    // v x (B k_hat) = (vy B) i_hat - (vx B) j_hat
    const Fx = q * (E.x + p.vy * B);
    const Fy = q * (E.y - p.vx * B);

    const ax = Fx / p.m;
    const ay = Fy / p.m;

    const newVx = p.vx + ax * dt;
    const newVy = p.vy + ay * dt;
    const newX = p.x + newVx * dt;
    const newY = p.y + newVy * dt;

    const trail = [...(p.trail || []), { x: newX, y: newY }];
    if (trail.length > 250) trail.shift();

    return {
      ...p,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      trail,
    };
  }

  // --- DOUBLE SLIT INTERFERENCE ---
  static calcDoubleSlitIntensity(
    y: number, // position on screen
    d: number, // slit distance (mm)
    D: number, // screen distance (m)
    wavelength: number, // (nm)
    I0: number = 1
  ) {
    const lambda = wavelength * 1e-9;
    const slitDist = d * 1e-3;
    const theta = Math.atan(y / D);
    const pathDiff = slitDist * Math.sin(theta);
    const phaseDiff = (2 * Math.PI / lambda) * pathDiff;
    const intensity = 4 * I0 * Math.pow(Math.cos(phaseDiff / 2), 2);
    const fringeWidth = (lambda * D) / slitDist; // in meters

    return {
      intensity,
      pathDiff,
      phaseDiff,
      fringeWidthMM: fringeWidth * 1e3,
    };
  }

  // --- THERMODYNAMICS ---
  static calcGasProcess(p1: number, v1: number, v2: number, processType: 'isothermal' | 'isobaric' | 'isochoric' | 'adiabatic', gamma: number = 1.4) {
    let p2 = p1;
    let work = 0;
    const nR = 8.314; // normalized mole constant scale

    if (processType === 'isothermal') {
      p2 = p1 * (v1 / v2);
      work = p1 * v1 * Math.log(v2 / v1);
    } else if (processType === 'isobaric') {
      p2 = p1;
      work = p1 * (v2 - v1);
    } else if (processType === 'isochoric') {
      p2 = p1 * (v2 / v1);
      work = 0;
    } else if (processType === 'adiabatic') {
      p2 = p1 * Math.pow(v1 / v2, gamma);
      work = (p1 * v1 - p2 * v2) / (gamma - 1);
    }

    const temp1 = p1 * v1;
    const temp2 = p2 * v2;
    const deltaU = (nR / (gamma - 1)) * (temp2 - temp1);
    const heatQ = deltaU + work;

    return { p2, work, deltaU, heatQ, temp1, temp2 };
  }

  // --- GRAVITATION & ORBITAL MECHANICS ---
  static stepOrbitParticle(
    p: ParticleObject,
    centralMass: number,
    G: number = 1000, // Simulation-scaled Gravitational Constant
    dt: number
  ): ParticleObject {
    const r2 = p.x * p.x + p.y * p.y;
    const r = Math.sqrt(r2);
    if (r < 5) return p; // collision threshold

    const accelMag = (G * centralMass) / r2;
    const ax = -accelMag * (p.x / r);
    const ay = -accelMag * (p.y / r);

    const newVx = p.vx + ax * dt;
    const newVy = p.vy + ay * dt;
    const newX = p.x + newVx * dt;
    const newY = p.y + newVy * dt;

    const trail = [...(p.trail || []), { x: newX, y: newY }];
    if (trail.length > 300) trail.shift();

    return {
      ...p,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      trail,
    };
  }

  static calcEscapeAndOrbitalSpeed(centralMass: number, r: number, G: number = 1000) {
    const vOrbital = Math.sqrt((G * centralMass) / r);
    const vEscape = Math.sqrt((2 * G * centralMass) / r);
    return { vOrbital, vEscape };
  }

  // --- RC TRANSIENT CIRCUITS ---
  static calcRCCircuitState(t: number, V0: number, R: number, C: number, isCharging: boolean = true) {
    const tau = R * C * 1e-3; // ms to s scale
    const safeTau = Math.max(1e-6, tau);
    const expTerm = Math.exp(-t / safeTau);

    let vC = 0;
    let iCurrent = 0;

    if (isCharging) {
      vC = V0 * (1 - expTerm);
      iCurrent = (V0 / R) * expTerm;
    } else {
      vC = V0 * expTerm;
      iCurrent = -(V0 / R) * expTerm;
    }

    const vR = iCurrent * R;
    const energyCap = 0.5 * (C * 1e-6) * vC * vC;

    return { vC, vR, iCurrent, tau, energyCap };
  }

  // --- ROTATIONAL DYNAMICS (ROLLING ON INCLINE) ---
  static calcRollingIncline(
    mass: number,
    radius: number,
    inclineDeg: number,
    shape: 'solid_sphere' | 'hollow_sphere' | 'cylinder' | 'ring',
    g: number = 9.8
  ) {
    let beta = 0; // k^2 / R^2
    if (shape === 'solid_sphere') beta = 2 / 5;
    else if (shape === 'hollow_sphere') beta = 2 / 3;
    else if (shape === 'cylinder') beta = 1 / 2;
    else if (shape === 'ring') beta = 1.0;

    const rad = (inclineDeg * Math.PI) / 180;
    const aLinear = (g * Math.sin(rad)) / (1 + beta);
    const alphaAngular = aLinear / radius;
    const requiredFriction = (mass * g * Math.sin(rad)) / (1 + 1 / beta);

    return { aLinear, alphaAngular, requiredFriction, beta };
  }
}


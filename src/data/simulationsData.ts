import { SimulationPreset } from '../types/physics';

export const SIMULATION_PRESETS: SimulationPreset[] = [
  // 1. ELECTROSTATICS - COULOMB & FIELD
  {
    id: 'electrostatics_charges',
    moduleId: 'electrostatics',
    chapterName: 'Electrostatics',
    title: 'Coulomb Law & Electric Field Vector Field',
    tag: 'JEE Advanced',
    description: 'Explore multi-point charge dynamics, electric field vectors, potential heatmaps, and dielectric medium screening.',
    controls: [
      { id: 'q1', label: 'Charge 1 (q₁)', unit: 'µC', value: 4, min: -10, max: 10, step: 1 },
      { id: 'q2', label: 'Charge 2 (q₂)', unit: 'µC', value: -4, min: -10, max: 10, step: 1 },
      { id: 'dist', label: 'Separation Distance (r)', unit: 'm', value: 2.5, min: 0.5, max: 5.0, step: 0.1 },
      { id: 'dielectric', label: 'Dielectric Constant (K)', unit: '', value: 1.0, min: 1.0, max: 80.0, step: 1.0 },
    ],
    formulas: [
      {
        title: "Coulomb's Law in Medium",
        latexTemplate: "F = \\frac{1}{4\\pi\\varepsilon_0 K} \\frac{|q_1 q_2|}{r^2}",
        evaluatedString: "F = 9.0e9 / K * (|q1 * q2| * 1e-12) / r^2",
        vars: [
          { symbol: 'q_1', label: 'Charge 1', value: 4, unit: 'µC' },
          { symbol: 'q_2', label: 'Charge 2', value: -4, unit: 'µC' },
          { symbol: 'r', label: 'Distance', value: 2.5, unit: 'm' },
          { symbol: 'K', label: 'Dielectric', value: 1, unit: '' },
        ]
      },
      {
        title: "Electric Field Magnitude",
        latexTemplate: "E = \\frac{k_{eff} \\cdot |q|}{r^2}",
        evaluatedString: "E = (9.0e9 / K) * |q| / r^2",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'zero_field_point',
        title: 'Find Neutral Point (E = 0)',
        description: 'Set q₁ = +9µC and q₂ = +4µC. Calculate & probe the exact location between them where net electric field becomes zero.',
        hint: 'Equate E₁ = E₂ => r₁ / r₂ = sqrt(q₁ / q₂)',
        targetConditionText: 'Probe placed at Neutral Point with |E| < 1.0 kN/C',
        checkFn: (simData: any) => {
          const q1 = simData.params.q1;
          const q2 = simData.params.q2;
          const isCorrectCharges = q1 === 9 && q2 === 4;
          const probeE = simData.probeEMag || 999;
          const isZeroE = probeE < 1500;
          return {
            isSuccess: isCorrectCharges && isZeroE,
            progressPercent: isCorrectCharges ? (isZeroE ? 100 : 50) : 10,
            currentValText: `q1=${q1}, q2=${q2}, Probe |E|=${(probeE / 1000).toFixed(2)} kN/C`
          };
        }
      }
    ],
    defaultParams: { q1: 4, q2: -4, dist: 2.5, dielectric: 1.0 },
    supportedGraphKeys: [
      { key: 'force', label: 'Coulomb Force (F)', unit: 'N', color: '#ef4444' },
      { key: 'potentialAtProbe', label: 'Electric Potential (V)', unit: 'kV', color: '#38bdf8' }
    ]
  },

  // 2. ELECTROSTATICS - ELECTRIC DIPOLE & TORQUE
  {
    id: 'electrostatics_dipole',
    moduleId: 'electrostatics',
    chapterName: 'Electrostatics',
    title: 'Electric Dipole Torque, Energy & Oscillation',
    tag: 'JEE Advanced',
    description: 'Simulate dipole moment p = q·d in uniform E-field, torque τ = p × E, potential energy U = -p·E, and angular SHM.',
    controls: [
      { id: 'pMag', label: 'Dipole Moment (p)', unit: 'nC·m', value: 5, min: 1, max: 20, step: 1 },
      { id: 'angleDeg', label: 'Angle with Field (θ)', unit: 'deg', value: 30, min: 0, max: 180, step: 5 },
      { id: 'eField', label: 'Electric Field (E)', unit: 'kV/m', value: 10, min: 1, max: 50, step: 1 },
    ],
    formulas: [
      {
        title: "Torque on Dipole",
        latexTemplate: "\\vec{\\tau} = \\vec{p} \\times \\vec{E} = p E \\sin\\theta",
        evaluatedString: "tau = p * E * sin(theta)",
        vars: [
          { symbol: 'p', label: 'Dipole Moment', value: 5, unit: 'nC·m' },
          { symbol: 'E', label: 'E-Field', value: 10, unit: 'kV/m' },
          { symbol: '\\theta', label: 'Angle', value: 30, unit: '°' }
        ]
      },
      {
        title: "Potential Energy of Dipole",
        latexTemplate: "U = -\\vec{p} \\cdot \\vec{E} = -p E \\cos\\theta",
        evaluatedString: "U = -p * E * cos(theta)",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'stable_equilibrium',
        title: 'Find Stable Equilibrium Angle',
        description: 'Set the dipole angle θ to achieve minimum potential energy U = -pE (stable equilibrium).',
        hint: 'U is minimum when cos(θ) = 1 => θ = 0°',
        targetConditionText: 'Angle θ = 0° (Stable Equilibrium)',
        checkFn: (simData: any) => {
          const angle = simData.params.angleDeg;
          const isTarget = Math.abs(angle - 0) < 1;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : Math.max(0, 100 - angle),
            currentValText: `Angle = ${angle}°`
          };
        }
      }
    ],
    defaultParams: { pMag: 5, angleDeg: 30, eField: 10 },
    supportedGraphKeys: [
      { key: 'dipoleTorque', label: 'Torque (τ)', unit: 'N·m', color: '#a855f7' },
      { key: 'dipoleEnergy', label: 'Potential Energy (U)', unit: 'J', color: '#38bdf8' }
    ]
  },

  // 3. ELECTROSTATICS - GAUSS LAW & SPHERICAL DISTRIBUTIONS
  {
    id: 'electrostatics_gauss',
    moduleId: 'electrostatics',
    chapterName: 'Electrostatics',
    title: 'Gauss Law: Conducting vs Non-Conducting Sphere',
    tag: 'JEE Advanced',
    description: 'Calculate flux Φ = ∮ E·dA = Q/ε₀, and compare E(r) and V(r) profiles inside & outside conducting & non-conducting spheres.',
    controls: [
      { id: 'sphereRadius', label: 'Sphere Radius (R)', unit: 'm', value: 10, min: 2, max: 20, step: 1 },
      { id: 'gaussianRadius', label: 'Gaussian Radius (r)', unit: 'm', value: 15, min: 1, max: 40, step: 1 },
      { id: 'totalCharge', label: 'Total Charge (Q)', unit: 'µC', value: 5, min: 1, max: 20, step: 1 },
      { id: 'isConducting', label: 'Sphere Type (1=Conducting, 0=Non-Conducting)', unit: '', value: 1, min: 0, max: 1, step: 1 },
    ],
    formulas: [
      {
        title: "Gauss's Law Flux",
        latexTemplate: "\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enclosed}}{\\varepsilon_0}",
        evaluatedString: "Phi = Q / eps0",
        vars: [
          { symbol: 'Q', label: 'Charge', value: 5, unit: 'µC' }
        ]
      },
      {
        title: "E-Field Inside Non-Conducting Sphere",
        latexTemplate: "E_{in} = \\frac{k Q r}{R^3}",
        evaluatedString: "E_in = k * Q * r / R^3",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'zero_inside_field',
        title: 'Verify Zero Field Inside Conducting Sphere',
        description: 'Set sphere to Conducting (type=1) and move Gaussian radius r inside (r < R = 10m).',
        hint: 'In a conductor, free charges reside on the outer surface, so Q_enclosed = 0 inside.',
        targetConditionText: 'r < 10m in Conducting Sphere',
        checkFn: (simData: any) => {
          const r = simData.params.gaussianRadius;
          const R = simData.params.sphereRadius;
          const isCond = simData.params.isConducting === 1;
          const isTarget = isCond && r < R;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : (isCond ? 50 : 20),
            currentValText: `r=${r}m, R=${R}m, Type=${isCond ? 'Conducting' : 'Non-Conducting'}`
          };
        }
      }
    ],
    defaultParams: { sphereRadius: 10, gaussianRadius: 15, totalCharge: 5, isConducting: 1 },
    supportedGraphKeys: [
      { key: 'gaussEField', label: 'Electric Field E(r)', unit: 'kV/m', color: '#f59e0b' },
      { key: 'gaussPotential', label: 'Potential V(r)', unit: 'kV', color: '#38bdf8' }
    ]
  },

  // 4. ELECTROSTATICS - CAPACITORS & DIELECTRIC INSERTION
  {
    id: 'electrostatics_capacitor',
    moduleId: 'electrostatics',
    chapterName: 'Electrostatics',
    title: 'Parallel Plate Capacitor & Dielectric Insertion',
    tag: 'JEE Main',
    description: 'Investigate C = Kε₀A/d, stored energy U = ½CV², energy density u = ½ε₀E², and Constant Voltage vs Constant Charge modes.',
    controls: [
      { id: 'areaCm2', label: 'Plate Area (A)', unit: 'cm²', value: 100, min: 20, max: 300, step: 10 },
      { id: 'distMm', label: 'Plate Distance (d)', unit: 'mm', value: 5, min: 1, max: 15, step: 1 },
      { id: 'dielectricK', label: 'Dielectric Constant (K)', unit: '', value: 3.0, min: 1.0, max: 10.0, step: 0.5 },
      { id: 'voltage', label: 'Supply Voltage (V₀)', unit: 'V', value: 12, min: 1, max: 30, step: 1 },
      { id: 'isBatteryConnected', label: 'Battery Mode (1=Connected, 0=Disconnected)', unit: '', value: 1, min: 0, max: 1, step: 1 },
    ],
    formulas: [
      {
        title: "Capacitance with Dielectric",
        latexTemplate: "C = K \\frac{\\varepsilon_0 A}{d}",
        evaluatedString: "C = K * eps0 * A / d",
        vars: [
          { symbol: 'A', label: 'Area', value: 100, unit: 'cm²' },
          { symbol: 'd', label: 'Distance', value: 5, unit: 'mm' },
          { symbol: 'K', label: 'Dielectric', value: 3.0, unit: '' }
        ]
      },
      {
        title: "Stored Electrostatic Energy",
        latexTemplate: "U = \\frac{1}{2} C V^2 = \\frac{Q^2}{2C}",
        evaluatedString: "U = 0.5 * C * V^2",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'triple_capacitance',
        title: 'Triple Capacitance via Dielectric Insertion',
        description: 'Insert a dielectric slab with K = 3.0 into a vacuum capacitor of d = 5mm.',
        hint: 'C_new = K * C_vacuum = 3 * C0',
        targetConditionText: 'Dielectric K = 3.0',
        checkFn: (simData: any) => {
          const K = simData.params.dielectricK;
          const isTarget = Math.abs(K - 3.0) < 0.1;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : (K / 3) * 100,
            currentValText: `K = ${K}`
          };
        }
      }
    ],
    defaultParams: { areaCm2: 100, distMm: 5, dielectricK: 3.0, voltage: 12, isBatteryConnected: 1 },
    supportedGraphKeys: [
      { key: 'capacitanceVal', label: 'Capacitance (C)', unit: 'pF', color: '#38bdf8' },
      { key: 'storedEnergy', label: 'Stored Energy (U)', unit: 'nJ', color: '#10b981' }
    ]
  },

  // 5. ELECTROSTATICS - INTERACTIVE MULTI-CHARGE SANDBOX
  {
    id: 'electrostatics_sandbox',
    moduleId: 'electrostatics',
    chapterName: 'Electrostatics',
    title: 'Interactive Multi-Charge Field & Potential Sandbox',
    tag: 'JEE Advanced',
    description: 'Free interactive playground: place positive and negative charges, inspect real-time equipotential rings and field vectors.',
    controls: [
      { id: 'q1', label: 'Charge 1 (q₁)', unit: 'µC', value: 6, min: -10, max: 10, step: 1 },
      { id: 'q2', label: 'Charge 2 (q₂)', unit: 'µC', value: -6, min: -10, max: 10, step: 1 },
      { id: 'dist', label: 'Distance (r)', unit: 'm', value: 3.0, min: 1.0, max: 6.0, step: 0.2 },
    ],
    formulas: [
      {
        title: "Superposition of Potential",
        latexTemplate: "V(x,y) = \\sum_{i} \\frac{k q_i}{r_i}",
        evaluatedString: "V = k * (q1/r1 + q2/r2)",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'quadrupole_balance',
        title: 'Symmetric Field Quadrupole',
        description: 'Set q₁ = +6µC and q₂ = -6µC to form an electric dipole field sandbox.',
        hint: 'Equal and opposite charges form dipole field lines.',
        targetConditionText: 'q₁ = +6µC, q₂ = -6µC',
        checkFn: (simData: any) => {
          const q1 = simData.params.q1;
          const q2 = simData.params.q2;
          const isTarget = q1 === 6 && q2 === -6;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : 50,
            currentValText: `q1=${q1}, q2=${q2}`
          };
        }
      }
    ],
    defaultParams: { q1: 6, q2: -6, dist: 3.0 },
    supportedGraphKeys: [
      { key: 'force', label: 'Coulomb Force (F)', unit: 'N', color: '#ef4444' }
    ]
  },

  {
    id: 'projectile_motion',
    moduleId: 'mechanics',
    chapterName: 'Kinematics',
    title: '2D Projectile Motion & Air Drag Simulator',
    tag: 'JEE Main',
    description: 'Investigate 2D parabolic trajectories, maximum height, flight duration, and velocity vector components.',
    controls: [
      { id: 'v0', label: 'Initial Velocity (v₀)', unit: 'm/s', value: 30, min: 5, max: 60, step: 1 },
      { id: 'angle', label: 'Launch Angle (θ)', unit: 'deg', value: 45, min: 5, max: 85, step: 1 },
      { id: 'g', label: 'Gravity Acceleration (g)', unit: 'm/s²', value: 9.8, min: 1.6, max: 24.8, step: 0.1 },
      { id: 'airDrag', label: 'Air Drag Coeff (Cd)', unit: '', value: 0, min: 0, max: 0.05, step: 0.005 },
    ],
    formulas: [
      {
        title: "Maximum Height",
        latexTemplate: "H_{max} = \\frac{v_0^2 \\sin^2\\theta}{2g}",
        evaluatedString: "H = (v0^2 * sin(angle)^2) / (2 * g)",
        vars: [
          { symbol: 'v_0', label: 'Speed', value: 30, unit: 'm/s' },
          { symbol: '\\theta', label: 'Angle', value: 45, unit: '°' },
          { symbol: 'g', label: 'Gravity', value: 9.8, unit: 'm/s²' }
        ]
      },
      {
        title: "Horizontal Range",
        latexTemplate: "R = \\frac{v_0^2 \\sin(2\\theta)}{g}",
        evaluatedString: "R = (v0^2 * sin(2*angle)) / g",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'max_range_angle',
        title: 'Discover Maximum Range Angle',
        description: 'For any constant initial speed v₀ without drag, find the exact angle that maximizes the total horizontal range.',
        hint: 'sin(2θ) reaches its maximum when 2θ = 90°',
        targetConditionText: 'Launch angle set to exactly 45°',
        checkFn: (simData: any) => {
          const angle = simData.params.angle;
          const is45 = Math.abs(angle - 45) < 0.5;
          return {
            isSuccess: is45,
            progressPercent: is45 ? 100 : Math.max(0, 100 - Math.abs(angle - 45) * 3),
            currentValText: `Current Angle = ${angle}°`
          };
        }
      }
    ],
    defaultParams: { v0: 30, angle: 45, g: 9.8, airDrag: 0 },
    supportedGraphKeys: [
      { key: 'posY', label: 'Height y(t)', unit: 'm', color: '#22c55e' },
      { key: 'vy', label: 'Vertical Velocity vy(t)', unit: 'm/s', color: '#f43f5e' }
    ]
  },

  // 3. OPTICS - LENS & MIRROR BENCH
  {
    id: 'ray_optics',
    moduleId: 'optics',
    chapterName: 'Ray Optics',
    title: 'Thin Lens & Mirror Principal Ray Bench',
    tag: 'JEE Advanced',
    description: 'Simulate real & virtual image formation using Gaussian lens formula, principal focal rays, and magnification.',
    controls: [
      { id: 'focalLength', label: 'Focal Length (f)', unit: 'cm', value: 15, min: 5, max: 40, step: 1 },
      { id: 'objectDist', label: 'Object Position (u)', unit: 'cm', value: -30, min: -80, max: -5, step: 1 },
      { id: 'objectHeight', label: 'Object Height (h₁)', unit: 'cm', value: 10, min: 2, max: 25, step: 1 },
    ],
    formulas: [
      {
        title: "Thin Lens Formula",
        latexTemplate: "\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}",
        evaluatedString: "1/v = 1/f + 1/u",
        vars: [
          { symbol: 'f', label: 'Focal Length', value: 15, unit: 'cm' },
          { symbol: 'u', label: 'Object Distance', value: -30, unit: 'cm' }
        ]
      },
      {
        title: "Transverse Magnification",
        latexTemplate: "m = \\frac{v}{u} = \\frac{h_2}{h_1}",
        evaluatedString: "m = v / u",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'real_equal_image',
        title: 'Form 1:1 Inverted Real Image',
        description: 'Position the object relative to a convex lens of f = 20cm so that the image is formed at the exact same size inverted (m = -1).',
        hint: 'Set u = -2f = -40cm',
        targetConditionText: 'f = 20cm, u = -40cm (m = -1.0)',
        checkFn: (simData: any) => {
          const f = simData.params.focalLength;
          const u = simData.params.objectDist;
          const isF20 = Math.abs(f - 20) < 0.5;
          const isU40 = Math.abs(u - (-40)) < 0.5;
          return {
            isSuccess: isF20 && isU40,
            progressPercent: isF20 ? (isU40 ? 100 : 50) : 20,
            currentValText: `f = ${f} cm, u = ${u} cm`
          };
        }
      }
    ],
    defaultParams: { focalLength: 15, objectDist: -30, objectHeight: 10 },
    supportedGraphKeys: [
      { key: 'imageDist', label: 'Image Distance (v)', unit: 'cm', color: '#a855f7' },
      { key: 'magnification', label: 'Magnification (m)', unit: '', color: '#f59e0b' }
    ]
  },

  // 4. OSCILLATIONS - SIMPLE PENDULUM & SHM
  {
    id: 'shm_pendulum',
    moduleId: 'shm_oscillations',
    chapterName: 'Simple Harmonic Motion',
    title: 'Non-Linear Simple Pendulum & Phase Space',
    tag: 'JEE Main',
    description: 'Study differential SHM dynamics, small angle approximation, damping effects, and energy interchange.',
    controls: [
      { id: 'length', label: 'Length (L)', unit: 'm', value: 1.5, min: 0.5, max: 4.0, step: 0.1 },
      { id: 'initialAngle', label: 'Initial Angle (θ₀)', unit: 'deg', value: 25, min: 5, max: 70, step: 1 },
      { id: 'damping', label: 'Damping Factor (γ)', unit: '', value: 0.05, min: 0, max: 0.5, step: 0.01 },
      { id: 'g', label: 'Gravity (g)', unit: 'm/s²', value: 9.8, min: 1.6, max: 20, step: 0.1 },
    ],
    formulas: [
      {
        title: "Time Period (Small Angle)",
        latexTemplate: "T = 2\\pi \\sqrt{\\frac{L}{g}}",
        evaluatedString: "T = 2 * PI * sqrt(L / g)",
        vars: [
          { symbol: 'L', label: 'Length', value: 1.5, unit: 'm' },
          { symbol: 'g', label: 'Gravity', value: 9.8, unit: 'm/s²' }
        ]
      }
    ],
    challenges: [
      {
        id: 'seconds_pendulum',
        title: 'Build a Seconds Pendulum (T = 2.0s)',
        description: 'Adjust the string length L under standard Earth gravity (g = 9.8 m/s²) so the time period becomes exactly 2 seconds.',
        hint: 'T = 2π √(L/g) => L = g / π²',
        targetConditionText: 'Length L ≈ 0.99 m',
        checkFn: (simData: any) => {
          const L = simData.params.length;
          const isTarget = Math.abs(L - 0.99) < 0.05;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : Math.max(0, 100 - Math.abs(L - 0.99) * 100),
            currentValText: `L = ${L} m`
          };
        }
      }
    ],
    defaultParams: { length: 1.5, initialAngle: 25, damping: 0.05, g: 9.8 },
    supportedGraphKeys: [
      { key: 'theta', label: 'Angle θ(t)', unit: 'rad', color: '#f59e0b' },
      { key: 'omega', label: 'Angular Speed ω(t)', unit: 'rad/s', color: '#38bdf8' }
    ]
  },

  // 5. MAGNETISM & EMI - LORENTZ FORCE & CYCLOTRON
  {
    id: 'lorentz_force',
    moduleId: 'magnetism_emi',
    chapterName: 'Magnetism & Moving Charges',
    title: 'Lorentz Force & Helical Motion in B-Field',
    tag: 'JEE Advanced',
    description: 'Observe charge trajectory under combined electric E and magnetic B fields, cyclotron radius, and helical pitch.',
    controls: [
      { id: 'bField', label: 'Magnetic Field (B)', unit: 'Tesla', value: 2.0, min: -5.0, max: 5.0, step: 0.5 },
      { id: 'eField', label: 'Electric Field (E_y)', unit: 'kV/m', value: 0, min: -10, max: 10, step: 1 },
      { id: 'particleSpeed', label: 'Speed (v)', unit: '10⁵ m/s', value: 5, min: 1, max: 20, step: 1 },
      { id: 'chargeQ', label: 'Charge (q)', unit: 'µC', value: 2, min: -5, max: 5, step: 1 },
    ],
    formulas: [
      {
        title: "Cyclotron Radius",
        latexTemplate: "r = \\frac{m v}{q B}",
        evaluatedString: "r = (m * v) / (|q| * |B|)",
        vars: [
          { symbol: 'B', label: 'Field', value: 2.0, unit: 'T' },
          { symbol: 'q', label: 'Charge', value: 2.0, unit: 'µC' }
        ]
      }
    ],
    challenges: [
      {
        id: 'velocity_selector',
        title: 'Configure Velocity Selector (E = v B)',
        description: 'Balance the downward electric force and upward magnetic force so that a particle with v = 5×10⁵ m/s moves completely undeflected.',
        hint: 'qE = qvB => E = v * B',
        targetConditionText: 'E = 10 kV/m when B = 2T & v = 5',
        checkFn: (simData: any) => {
          const E = simData.params.eField;
          const B = simData.params.bField;
          const v = simData.params.particleSpeed;
          const expectedE = v * B;
          const isBal = Math.abs(E - expectedE) < 0.5;
          return {
            isSuccess: isBal,
            progressPercent: isBal ? 100 : 30,
            currentValText: `E = ${E} kV/m, Expected = ${expectedE} kV/m`
          };
        }
      }
    ],
    defaultParams: { bField: 2.0, eField: 0, particleSpeed: 5, chargeQ: 2 },
    supportedGraphKeys: [
      { key: 'posY', label: 'Transverse Position y(t)', unit: 'mm', color: '#22c55e' }
    ]
  },

  // 6. WAVES - YOUNG DOUBLE SLIT
  {
    id: 'double_slit_interference',
    moduleId: 'waves',
    chapterName: 'Wave Optics',
    title: 'Young Double Slit Interference & Fringe Width',
    tag: 'JEE Main',
    description: 'Visualize constructive & destructive wave interference pattern, fringe width β = λD/d, and intensity curves.',
    controls: [
      { id: 'wavelength', label: 'Wavelength (λ)', unit: 'nm', value: 600, min: 380, max: 750, step: 10 },
      { id: 'slitSeparation', label: 'Slit Distance (d)', unit: 'mm', value: 0.5, min: 0.1, max: 2.0, step: 0.1 },
      { id: 'screenDist', label: 'Screen Distance (D)', unit: 'm', value: 1.5, min: 0.5, max: 3.0, step: 0.1 },
    ],
    formulas: [
      {
        title: "Fringe Width Formula",
        latexTemplate: "\\beta = \\frac{\\lambda D}{d}",
        evaluatedString: "beta = (lambda * D) / d",
        vars: [
          { symbol: '\\lambda', label: 'Wavelength', value: 600, unit: 'nm' },
          { symbol: 'D', label: 'Screen Dist', value: 1.5, unit: 'm' },
          { symbol: 'd', label: 'Slit Dist', value: 0.5, unit: 'mm' }
        ]
      }
    ],
    challenges: [
      {
        id: 'target_fringe_width',
        title: 'Achieve Fringe Width β = 3.6 mm',
        description: 'Adjust the slit separation d for λ = 600 nm and D = 1.5 m to get a wide, measurable fringe width of exactly 3.6 mm.',
        hint: 'd = λD / β = (600e-9 * 1.5) / 3.6e-3 = 0.25 mm',
        targetConditionText: 'Slit separation d = 0.25 mm',
        checkFn: (simData: any) => {
          const d = simData.params.slitSeparation;
          const isTarget = Math.abs(d - 0.25) < 0.02;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : Math.max(0, 100 - Math.abs(d - 0.25) * 200),
            currentValText: `d = ${d} mm`
          };
        }
      }
    ],
    defaultParams: { wavelength: 600, slitSeparation: 0.5, screenDist: 1.5 },
    supportedGraphKeys: [
      { key: 'fringeWidth', label: 'Fringe Width β', unit: 'mm', color: '#38bdf8' }
    ]
  },

  // 7. THERMODYNAMICS - PV DIAGRAM & CARNOT CYCLE
  {
    id: 'thermodynamics_pv',
    moduleId: 'thermodynamics',
    chapterName: 'Thermodynamics',
    title: 'Ideal Gas PV Indicator Diagram & Work Done',
    tag: 'JEE Advanced',
    description: 'Simulate Isothermal, Isobaric, Isochoric & Adiabatic thermodynamic processes, area under PV curve, and work done.',
    controls: [
      { id: 'p1', label: 'Initial Pressure (P₁)', unit: 'atm', value: 4, min: 1, max: 10, step: 0.5 },
      { id: 'v1', label: 'Initial Volume (V₁)', unit: 'L', value: 2, min: 1, max: 5, step: 0.5 },
      { id: 'v2', label: 'Final Volume (V₂)', unit: 'L', value: 6, min: 2, max: 10, step: 0.5 },
      { id: 'gamma', label: 'Adiabatic Index (γ)', unit: '', value: 1.4, min: 1.1, max: 1.67, step: 0.03 },
    ],
    formulas: [
      {
        title: "Work Done in Isothermal Process",
        latexTemplate: "W = nRT \\ln\\left(\\frac{V_2}{V_1}\\right) = P_1 V_1 \\ln\\left(\\frac{V_2}{V_1}\\right)",
        evaluatedString: "W = P1 * V1 * ln(V2 / V1)",
        vars: [
          { symbol: 'P_1', label: 'Pressure 1', value: 4, unit: 'atm' },
          { symbol: 'V_1', label: 'Volume 1', value: 2, unit: 'L' },
          { symbol: 'V_2', label: 'Volume 2', value: 6, unit: 'L' }
        ]
      },
      {
        title: "First Law of Thermodynamics",
        latexTemplate: "\\Delta Q = \\Delta U + W",
        evaluatedString: "dQ = dU + W",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'triple_volume_expansion',
        title: 'Compute Isothermal Work for 3x Expansion',
        description: 'Expand the gas volume from V₁ = 2 L to V₂ = 6 L at constant temperature under P₁ = 4 atm.',
        hint: 'W = P₁V₁ ln(3) = 4 * 2 * 1.0986 ≈ 8.79 L·atm',
        targetConditionText: 'V₁ = 2 L, V₂ = 6 L, P₁ = 4 atm',
        checkFn: (simData: any) => {
          const p1 = simData.params.p1;
          const v1 = simData.params.v1;
          const v2 = simData.params.v2;
          const isTarget = p1 === 4 && v1 === 2 && v2 === 6;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : (v2 / v1 >= 3 ? 70 : 30),
            currentValText: `P1=${p1}, V1=${v1}, V2=${v2}`
          };
        }
      }
    ],
    defaultParams: { p1: 4, v1: 2, v2: 6, gamma: 1.4 },
    supportedGraphKeys: [
      { key: 'workDone', label: 'Work Done (W)', unit: 'J', color: '#f59e0b' },
      { key: 'pressureP2', label: 'Final Pressure (P₂)', unit: 'atm', color: '#38bdf8' }
    ]
  },

  // 8. GRAVITATION - PLANETARY & SATELLITE ORBITS
  {
    id: 'gravitation_orbits',
    moduleId: 'gravitation',
    chapterName: 'Gravitation',
    title: 'Keplerian Satellite Orbits & Escape Velocity',
    tag: 'JEE Advanced',
    description: 'Explore elliptical planetary trajectories, Kepler 3rd Law (T² ∝ a³), orbital velocity, and escape threshold.',
    controls: [
      { id: 'centralMass', label: 'Central Star Mass (M)', unit: 'M_sun', value: 100, min: 20, max: 300, step: 10 },
      { id: 'orbitRadius', label: 'Initial Distance (r₀)', unit: 'AU', value: 120, min: 40, max: 250, step: 5 },
      { id: 'launchSpeed', label: 'Tangential Speed (v₀)', unit: 'km/s', value: 28, min: 5, max: 60, step: 1 },
    ],
    formulas: [
      {
        title: "Escape Velocity Formula",
        latexTemplate: "v_e = \\sqrt{\\frac{2GM}{R}}",
        evaluatedString: "ve = sqrt(2 * G * M / R)",
        vars: [
          { symbol: 'M', label: 'Mass', value: 100, unit: 'units' },
          { symbol: 'R', label: 'Distance', value: 120, unit: 'units' }
        ]
      },
      {
        title: "Circular Orbital Speed",
        latexTemplate: "v_o = \\sqrt{\\frac{GM}{r}}",
        evaluatedString: "vo = sqrt(G * M / r)",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'stable_circular_orbit',
        title: 'Establish Stable Circular Orbit',
        description: 'Set central mass M = 100 and distance r₀ = 100. Adjust v₀ to match exact circular velocity v₀ = √(G M / r₀).',
        hint: 'With G=1000, v_o = sqrt(1000 * 100 / 100) = sqrt(1000) ≈ 31.6 km/s',
        targetConditionText: 'v₀ set to ~31.6 km/s for r₀ = 100',
        checkFn: (simData: any) => {
          const v0 = simData.params.launchSpeed;
          const r0 = simData.params.orbitRadius;
          const M = simData.params.centralMass;
          const isTarget = r0 === 100 && M === 100 && Math.abs(v0 - 32) <= 1;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : 40,
            currentValText: `r0=${r0}, v0=${v0} km/s`
          };
        }
      }
    ],
    defaultParams: { centralMass: 100, orbitRadius: 120, launchSpeed: 28 },
    supportedGraphKeys: [
      { key: 'orbitSpeed', label: 'Orbital Speed (v)', unit: 'km/s', color: '#10b981' }
    ]
  },

  // 9. CIRCUITS - TRANSIENT RC CHARGING
  {
    id: 'circuits_rc',
    moduleId: 'circuits',
    chapterName: 'Current Electricity & Capacitors',
    title: 'Transient RC Charging & Discharging Curve',
    tag: 'JEE Main',
    description: 'Analyze exponential capacitor charging V(t) = V₀(1 - e^{-t/RC}), time constant τ = RC, and energy storage.',
    controls: [
      { id: 'vSource', label: 'DC Voltage (V₀)', unit: 'V', value: 12, min: 1, max: 24, step: 1 },
      { id: 'resistance', label: 'Resistance (R)', unit: 'kΩ', value: 10, min: 1, max: 50, step: 1 },
      { id: 'capacitance', label: 'Capacitance (C)', unit: 'µF', value: 100, min: 10, max: 500, step: 10 },
    ],
    formulas: [
      {
        title: "Capacitor Voltage Charging",
        latexTemplate: "V_C(t) = V_0 \\left(1 - e^{-t / RC}\\right)",
        evaluatedString: "Vc = V0 * (1 - exp(-t / (R * C)))",
        vars: [
          { symbol: 'V_0', label: 'Voltage', value: 12, unit: 'V' },
          { symbol: 'R', label: 'Resistance', value: 10, unit: 'kΩ' },
          { symbol: 'C', label: 'Capacitance', value: 100, unit: 'µF' }
        ]
      },
      {
        title: "Time Constant",
        latexTemplate: "\\tau = R \\cdot C",
        evaluatedString: "tau = R * C = 1.00 s",
        vars: []
      }
    ],
    challenges: [
      {
        id: 'target_time_constant',
        title: 'Design Circuit for Time Constant τ = 1.0 s',
        description: 'Select R and C values such that the time constant τ = R × C equals exactly 1.0 second.',
        hint: 'R = 10 kΩ (10,000 Ω) and C = 100 µF (0.0001 F) gives τ = 1.0 s',
        targetConditionText: 'R = 10 kΩ, C = 100 µF',
        checkFn: (simData: any) => {
          const R = simData.params.resistance;
          const C = simData.params.capacitance;
          const tau = (R * 1e3) * (C * 1e-6);
          const isTarget = Math.abs(tau - 1.0) < 0.05;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : Math.max(0, 100 - Math.abs(tau - 1.0) * 80),
            currentValText: `τ = ${tau.toFixed(2)} s`
          };
        }
      }
    ],
    defaultParams: { vSource: 12, resistance: 10, capacitance: 100 },
    supportedGraphKeys: [
      { key: 'vCapacitor', label: 'Capacitor Voltage (Vc)', unit: 'V', color: '#38bdf8' },
      { key: 'iCurrent', label: 'Circuit Current (I)', unit: 'mA', color: '#ef4444' }
    ]
  },

  // 10. ROTATION - ROLLING ON INCLINED PLANE
  {
    id: 'rotation_rolling',
    moduleId: 'rotation',
    chapterName: 'Rotational Motion',
    title: 'Pure Rolling vs Slipping on Inclined Plane',
    tag: 'JEE Advanced',
    description: 'Compare linear acceleration of Solid Sphere, Cylinder, and Ring rolling down an inclined plane.',
    controls: [
      { id: 'inclineAngle', label: 'Incline Angle (θ)', unit: 'deg', value: 30, min: 10, max: 60, step: 1 },
      { id: 'mass', label: 'Mass (M)', unit: 'kg', value: 2.0, min: 0.5, max: 5.0, step: 0.5 },
      { id: 'radius', label: 'Radius (R)', unit: 'm', value: 0.5, min: 0.1, max: 1.0, step: 0.05 },
    ],
    formulas: [
      {
        title: "Acceleration of Rolling Body",
        latexTemplate: "a = \\frac{g \\sin\\theta}{1 + \\frac{k^2}{R^2}}",
        evaluatedString: "a = (g * sin(theta)) / (1 + beta)",
        vars: [
          { symbol: '\\theta', label: 'Incline', value: 30, unit: '°' },
          { symbol: 'g', label: 'Gravity', value: 9.8, unit: 'm/s²' }
        ]
      }
    ],
    challenges: [
      {
        id: 'fastest_rolling_shape',
        title: 'Identify Fastest Rolling Body',
        description: 'Observe which shape reaches the highest acceleration down a 30° incline.',
        hint: 'Solid Sphere has k²/R² = 2/5 = 0.4 (smallest denominator, highest a)',
        targetConditionText: 'Incline angle set to 30°',
        checkFn: (simData: any) => {
          const angle = simData.params.inclineAngle;
          const isTarget = angle === 30;
          return {
            isSuccess: isTarget,
            progressPercent: isTarget ? 100 : 50,
            currentValText: `Incline Angle = ${angle}°`
          };
        }
      }
    ],
    defaultParams: { inclineAngle: 30, mass: 2.0, radius: 0.5 },
    supportedGraphKeys: [
      { key: 'rollingAccel', label: 'Linear Acceleration (a)', unit: 'm/s²', color: '#8b5cf6' }
    ]
  }
];


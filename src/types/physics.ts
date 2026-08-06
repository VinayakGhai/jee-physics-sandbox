export type ModuleId =
  | 'electrostatics'
  | 'mechanics'
  | 'magnetism_emi'
  | 'optics'
  | 'shm_oscillations'
  | 'waves'
  | 'thermodynamics'
  | 'gravitation'
  | 'circuits'
  | 'rotation';

export type LearningMode = 'explore' | 'challenge' | 'experiment' | 'socratic';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ChargeObject {
  id: string;
  x: number;
  y: number;
  q: number; // in microCoulombs or relative units
  radius: number;
  isFixed?: boolean;
}

export interface ParticleObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  m: number;
  radius: number;
  color?: string;
  trail?: Vector2D[];
}

export interface DipoleObject {
  id: string;
  x: number;
  y: number;
  pMagnitude: number; // Dipole moment magnitude (p = q * d)
  angleDeg: number;   // Angle relative to E-field
  length: number;     // Separation distance d
}

export interface CapacitorObject {
  plateArea: number;
  plateDistance: number;
  dielectricK: number;
  voltage: number;
  dielectricInsertionPercent: number;
  isBatteryConnected: boolean;
}

export interface GaussDistributionObject {
  type: 'conducting_sphere' | 'non_conducting_sphere' | 'line_charge' | 'sheet_charge';
  radius: number;
  totalCharge: number;
  surfaceChargeDensity?: number;
  linearChargeDensity?: number;
}


export interface OpticalObject {
  type: 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror' | 'slab';
  x: number;
  focalLength: number; // in cm / units
  refractiveIndex?: number;
}

export interface OpticalSource {
  x: number;
  height: number;
}

export interface ParameterControl {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description?: string;
}

export interface FormulaVar {
  symbol: string;
  label: string;
  value: number;
  unit: string;
}

export interface LiveFormula {
  title: string;
  latexTemplate: string; // e.g. "F = \frac{1}{4\pi\varepsilon_0 \cdot K} \frac{|q_1 q_2|}{r^2}"
  evaluatedString: string; // e.g. "F = 9.0e9 * (2.0 * 3.0) / (1.5)^2 = 24.00 N"
  vars: FormulaVar[];
}

export interface ChallengeGoal {
  id: string;
  title: string;
  description: string;
  hint: string;
  targetConditionText: string;
  checkFn: (simData: any) => { isSuccess: boolean; progressPercent: number; currentValText: string };
}

export interface SimulationPreset {
  id: string;
  moduleId: ModuleId;
  chapterName: string;
  title: string;
  tag: 'JEE Main' | 'JEE Advanced' | 'Foundation';
  description: string;
  controls: ParameterControl[];
  formulas: LiveFormula[];
  challenges: ChallengeGoal[];
  defaultParams: Record<string, number>;
  supportedGraphKeys: { key: string; label: string; unit: string; color: string }[];
}

export interface GraphDataPoint {
  t: number;
  [key: string]: number;
}

export interface AIProviderConfig {
  provider: 'gemini' | 'groq' | 'openrouter' | 'ollama' | 'custom';
  apiKey: string;
  customEndpoint?: string;
  modelName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface VectorOverlayOptions {
  showVectors: boolean;
  showTrails: boolean;
  showFieldGrid: boolean;
  showEquipotentials: boolean;
}

export interface SimPlayControlState {
  isPlaying: boolean;
  timeSpeed: number; // 0.25, 0.5, 1.0, 2.0
}


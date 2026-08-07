# ⚛️ JEE Physics Sandbox & AI Discovery Platform

[![License: GPL v2](https://img.shields.io/badge/License-GPLv2-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![KaTeX](https://img.shields.io/badge/KaTeX-Math--Rendering-00b894.svg)](https://katex.org/)

**JEE Physics Sandbox** is an interactive, visually intuitive simulation engine and AI tutoring platform designed specifically for **IIT-JEE Main & Advanced** physics education. 

Rather than relying on static formulas and memorization, JEE Sandbox empowers students to discover physical concepts through **real-time experimentation**, live vector fields, equipotential contour heatmaps, dynamic KaTeX equation evaluation, and Socratic AI mentoring.

---

## 🌟 Core Features

- ⚡ **Complete JEE Electrostatics Suite**: Multi-charge Coulomb force superposition, Electric field vectors, Equipotential contours, Dipole dynamics, Gauss's Law spherical distributions, and Parallel Plate Capacitors with dielectric slab insertion.
- 📐 **Live KaTeX Math Engine**: Publication-grade mathematical expressions rendering real-time LaTeX formulas with instant numerical evaluation as you drag parameter sliders.
- 🎯 **Interactive HUD & Vector Controls**: Toggleable force ($\mathbf{F}$), velocity ($\mathbf{v}$), electric field ($\mathbf{E}$), and magnetic field ($\mathbf{B}$) vector overlays with play/pause, step frame, and time speed controls ($0.25\times \dots 2.0\times$).
- 📊 **Real-Time Telemetry & CSV Export**: Plot real-time variable histories (potential, force, field magnitude, capacitance, energy) with one-click **CSV data export** for lab analysis.
- 🤖 **Socratic AI Mentor (Gemini 3.6 Flash + Offline Fallback)**: Intelligent AI tutor providing conceptual intuition, step-by-step derivations, and standard JEE exam trap callouts. Works both online (via Gemini API) and offline (rule-based Socratic engine).
- 🐧 **Native Linux Desktop App**: Packaged with Electron integration so it can run as a lightweight, standalone native Linux desktop application.
- 🧱 **Modular Engine Architecture**: Built upon a decoupled simulation framework (`PhysicsEngine`, `CanvasRenderer`, `PresetEngine`) enabling seamless expansion to Current Electricity, Magnetism, Optics, Mechanics, and Thermodynamics.

---

## 📦 Download Desktop Packages & Executables

Download ready-to-run packages directly from [GitHub Releases v1.0.3](https://github.com/VinayakGhai/jee-physics-sandbox/releases/tag/v1.0.3):

### 🐧 Linux Packages
- 🚀 **AppImage Portable Executable**: [Download `JEE-Physics-Sandbox-1.0.3.AppImage`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/JEE-Physics-Sandbox-1.0.3.AppImage)
  - *Quick Run*: `chmod +x JEE-Physics-Sandbox-1.0.3.AppImage && ./JEE-Physics-Sandbox-1.0.3.AppImage`
- 📦 **Tarball Archive Package (`.tar.gz`)**: [Download `jee-physics-studio-1.0.3.tar.gz`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/jee-physics-studio-1.0.3.tar.gz)

### 🪟 Windows Packages
- ⚙️ **Direct Setup Executable (`.exe`)**: [Download `JEE-Physics-Sandbox-1.0.2-Setup.exe`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.2/JEE-Physics-Sandbox-1.0.2-Setup.exe)
- 📦 **Portable Zip Package (`.zip`)**: [Download `JEE-Physics-Sandbox-1.0.3-win.zip`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/JEE-Physics-Sandbox-1.0.3-win.zip)

---


## 🚀 Quickstart & Tutorial

### Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your system.

```bash
node -v
npm -v
```

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/VinayakGhai/jee-physics-sandbox.git
cd jee-physics-sandbox

# Install npm packages
npm install
```

---

### 2. Run the Web Development Application

Start the local Express & Vite development server:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

### 3. Run as Native Linux Desktop App

To launch JEE Sandbox inside a standalone Linux desktop window:

```bash
npm run desktop
```

---

### 4. Build for Production

To create an optimized production bundle:

```bash
npm run build
npm start
```

---

## 🔬 Electrostatics Suite Breakdown

The initial release features 6 comprehensive JEE Electrostatics presets:

| Simulation Preset | JEE Syllabus Concepts & Equations | Key Experimentation |
| :--- | :--- | :--- |
| **Coulomb Law & Field Superposition** | $F = \frac{1}{4\pi\varepsilon_0 K} \frac{\|q_1 q_2\|}{r^2}$, $E_{net} = 0$ | Drag charges $q_1, q_2$, change dielectric $K$, and locate neutral points. |
| **Electric Dipole Dynamics** | $\vec{\tau} = \vec{p} \times \vec{E}$, $U = -\vec{p} \cdot \vec{E}$, $T = 2\pi\sqrt{\frac{I}{pE}}$ | Rotate angle $\theta$, observe torque arc, and test stable ($\theta=0^\circ$) vs unstable ($\theta=180^\circ$) equilibrium. |
| **Gauss's Law Distributions** | $\Phi_E = \oint \vec{E} \cdot d\vec{A} = \frac{Q_{enc}}{\varepsilon_0}$ | Compare Conducting ($E_{in}=0$) vs Non-Conducting ($E_{in}\propto r$) spheres with live $E(r)$ curve HUD. |
| **Capacitors & Dielectrics** | $C = K \frac{\varepsilon_0 A}{d}$, $U = \frac{1}{2} C V^2$, $u = \frac{1}{2}\varepsilon_0 E^2$ | Insert dielectric slab $K$, compare **Battery Connected** ($V$ constant) vs **Battery Disconnected** ($Q$ constant) modes. |
| **Multi-Charge Field Sandbox** | $V(x,y) = \sum \frac{k q_i}{r_i}$ | Interactive playground to place positive and negative charges, viewing equipotential rings and field grids. |
| **2D Ray & Wave Optics / SHM** | Thin lens optics, Young's double-slit interference, RK4 pendulum SHM | Explore wave fringe spacing $\beta = \frac{\lambda D}{d}$ and lens magnification $m = v/u$. |

---

## 🛠️ Project Structure

```
jee-physics-sandbox/
├── server.ts                 # Express backend server with Gemini AI endpoint & Vite SPA handler
├── desktop-main.cjs          # Electron native Linux desktop app launcher
├── package.json              # App scripts and npm dependencies
├── LICENSE                   # GNU General Public License v2.0 (GPLv2)
└── src/
    ├── App.tsx               # Main React dashboard layout & telemetry router
    ├── main.tsx              # Application entry point with KaTeX stylesheet
    ├── types/
    │   └── physics.ts        # Core TypeScript interfaces & simulation definitions
    ├── engine/
    │   ├── physicsEngine.ts  # Numerical solvers (Electrostatics, Gauss Law, Dipoles, RK4 SHM)
    │   └── canvasRenderer.ts # HTML5 Canvas 2D engine for vector fields, equipotentials & HUDs
    ├── data/
    │   └── simulationsData.ts# JEE preset registry with LaTeX templates & automated challenges
    └── components/
        ├── SimulationCanvas.tsx  # Interactive canvas HUD with drag controls & vector toggles
        ├── FormulaEngine.tsx     # Live KaTeX LaTeX formula evaluator
        ├── GraphEngine.tsx       # Real-time telemetry plotter with CSV export
        ├── ChallengePanel.tsx    # Automated JEE goal checker & hint accordion
        ├── AITeacher.tsx         # Socratic AI Physics Mentor (Online + Offline)
        └── Navbar.tsx            # Header controls & mode toggles
```

---

## 🔑 AI Mentor Configuration (Optional)

JEE Sandbox includes a built-in offline Socratic tutor out of the box. To enable live Gemini AI explanations:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Or enter your API Key inside the **Settings** modal in the app UI.

---

## 📜 License

This project is licensed under the **GNU General Public License v2.0 (GPLv2)**. See the [LICENSE](LICENSE) file for complete details.

---

### 👨‍💻 Author

Created by **Vinayak Ghai** ([@VinayakGhai](https://github.com/VinayakGhai))

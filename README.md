# ⚛️ JEE Physics Sandbox & AI Discovery Platform

[![License: GPL v2](https://img.shields.io/badge/License-GPLv2-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![KaTeX](https://img.shields.io/badge/KaTeX-Math--Rendering-00b894.svg)](https://katex.org/)

**JEE Physics Sandbox** is an interactive, visually intuitive simulation engine and AI tutoring platform designed specifically for **IIT-JEE Main & Advanced** physics education. 

Rather than relying on static formulas and memorization, JEE Sandbox empowers students to discover physical concepts through **real-time experimentation**, live vector fields, equipotential contour heatmaps, dynamic KaTeX equation evaluation, and Socratic AI mentoring.

---

## 📦 Standalone Desktop Downloads

Download ready-to-run apps directly from [GitHub Releases v1.0.3](https://github.com/VinayakGhai/jee-physics-sandbox/releases/tag/v1.0.3):

| Platform | Format | Download Link | Quick Instructions |
| :--- | :--- | :--- | :--- |
| 🪟 **Windows** | Direct Executable (`.exe`) | **[Download Setup `.exe`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/JEE-Physics-Sandbox-1.0.3-Setup.exe)** | Double-click to launch immediately |
| 🐧 **Linux** | AppImage (`.AppImage`) | **[Download `.AppImage`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/JEE-Physics-Sandbox-1.0.3.AppImage)** | `chmod +x JEE-Physics-Sandbox-1.0.3.AppImage && ./JEE-Physics-Sandbox-1.0.3.AppImage` |
| 🐧 **Linux** | Tarball Package (`.tar.gz`) | **[Download `.tar.gz`](https://github.com/VinayakGhai/jee-physics-sandbox/releases/download/v1.0.3/jee-physics-studio-1.0.3.tar.gz)** | Extract and run executable |

---

## 🌐 Live 24/7 Web App Deployment

To host this app on a live website, deploy it to your **Render** account with a single click. Render will automatically read the [`render.yaml`](render.yaml) configuration, build the Vite app, start the Express server, and host it on your custom subdomain (e.g. `jee-physics-sandbox.onrender.com`):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/VinayakGhai/jee-physics-sandbox)

> [!NOTE]
> Render subdomains are private to the account that deploys them. If you haven't deployed the repository on your Render dashboard yet, navigating to the URL will show **"Not Found"**. Click the button above to launch it under your own Render account!

---

## 🎮 How to Use JEE Sandbox (Guided App Tutorial)

Follow this step-by-step tutorial to get the most out of your physics discovery sessions:

### 1. Pick a Physics Chapter Preset
Use the top preset dropdown in the navigation header to switch between different **JEE Electrostatics** modules:
- ⚡ **Coulomb's Law & Neutral Points**: Explore 2-charge superposition, dielectric screening ($K$), and locate equilibrium points where $E_{net} = 0$.
- 🔄 **Electric Dipole Dynamics**: Manipulate dipole moments $\vec{p}$, observe torque vectors ($\vec{\tau} = \vec{p} \times \vec{E}$), potential energy $U = -\vec{p} \cdot \vec{E}$, and test stable vs unstable equilibrium angles.
- 🌐 **Gauss's Law Spherical Distributions**: Drag internal probe radius $r$ to compare conducting ($E_{in}=0$) vs non-conducting ($E_{in}\propto r$) charge distributions with live inset graphs.
- 🔋 **Parallel Plate Capacitors & Dielectrics**: Slide dielectric slabs $K$ into parallel plates under **Constant Voltage** (battery connected) or **Constant Charge** (battery disconnected) modes.

---

### 2. Experiment with Interactive Canvas HUD Controls
- **Drag & Drop**: Click and drag charges, dipole vectors, or probe points directly on the 2D Canvas stage.
- **Vector Overlays**: Toggle live Force ($\mathbf{F}$), Velocity ($\mathbf{v}$), Electric Field ($\mathbf{E}$), and Equipotential ring contours.
- **Playback Controls**: Use the play/pause button, step forward single frame, or adjust simulation speed ($0.25\times \dots 2.0\times$).

---

### 3. Inspect Live KaTeX Math & Dynamic Formula Evaluation
Click on the **Live Formulas & Math** bottom tab to view publication-grade LaTeX mathematical expressions. As you move parameter sliders, the numerical variables and step-by-step formula evaluation update in real time!

---

### 4. Engage with the Socratic AI Mentor
Click the ✨ **AI Mentor** button in the header:
- Ask conceptual questions like *"Why is electric potential zero at infinity?"* or *"Explain dipole oscillation frequency."*
- Receives step-by-step Socratic hints, physical intuitions, and JEE exam trap warnings.
- Works offline out of the box or connects to Google Gemini Flash API when an API key is configured.

---

### 5. Solve JEE Challenges & Export Telemetry
- Switch to **JEE Challenges** tab to tackle interactive quantitative goals (e.g., *"Adjust charge positions to achieve zero force at the origin"*).
- Switch to **Real-Time Telemetry Graph** to view historical plots of field magnitude, potential energy, or torque, and export your lab data with **1-click CSV Export**.

---

## 🔬 Detailed Electrostatics Module Breakdown

| Simulation Preset | JEE Syllabus Concepts & Equations | Key Experimentation |
| :--- | :--- | :--- |
| **Coulomb Law & Field Superposition** | $F = \frac{1}{4\pi\varepsilon_0 K} \frac{\|q_1 q_2\|}{r^2}$, $E_{net} = 0$ | Drag charges $q_1, q_2$, change dielectric $K$, and locate neutral points. |
| **Electric Dipole Dynamics** | $\vec{\tau} = \vec{p} \times \vec{E}$, $U = -\vec{p} \cdot \vec{E}$, $T = 2\pi\sqrt{\frac{I}{pE}}$ | Rotate angle $\theta$, observe torque arc, and test stable ($\theta=0^\circ$) vs unstable ($\theta=180^\circ$) equilibrium. |
| **Gauss's Law Distributions** | $\Phi_E = \oint \vec{E} \cdot d\vec{A} = \frac{Q_{enc}}{\varepsilon_0}$ | Compare Conducting ($E_{in}=0$) vs Non-Conducting ($E_{in}\propto r$) spheres with live $E(r)$ curve HUD. |
| **Capacitors & Dielectrics** | $C = K \frac{\varepsilon_0 A}{d}$, $U = \frac{1}{2} C V^2$, $u = \frac{1}{2}\varepsilon_0 E^2$ | Insert dielectric slab $K$, compare **Battery Connected** ($V$ constant) vs **Battery Disconnected** ($Q$ constant) modes. |
| **Multi-Charge Field Sandbox** | $V(x,y) = \sum \frac{k q_i}{r_i}$ | Interactive playground to place positive and negative charges, viewing equipotential rings and field grids. |

---

## 🛠️ Developer Setup & Source Build

If you want to run JEE Sandbox from source or contribute code:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/VinayakGhai/jee-physics-sandbox.git
cd jee-physics-sandbox
npm install
```

### 2. Run Local Web Dev Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### 3. Run Native Linux Desktop Window
```bash
npm run desktop
```

### 4. Package Release Executables
```bash
# Build Linux AppImage
npm run dist:linux

# Build Windows Setup Executable
npm run dist:win
```

---

## 🔑 AI Mentor Configuration (Optional)

JEE Sandbox includes a built-in offline Socratic tutor out of the box. To enable live Gemini AI explanations:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Enter your API Key inside the **Settings** modal in the app UI, or create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

---

## 📜 License

This project is licensed under the **GNU General Public License v2.0 (GPLv2)**. See the [LICENSE](LICENSE) file for details.

---

### 👨‍💻 Author

Created by **Vinayak Ghai** ([@VinayakGhai](https://github.com/VinayakGhai))

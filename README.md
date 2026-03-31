# 🌌 Structural Intelligence Dashboard

A futuristic, immersive 3D web application built with React + Three.js featuring a holographic neon-cyan aesthetic, real-time 3D geometry modeling, and interactive data visualization.

## 🚀 Live Demo

[![Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://dinos-proj.vercel.app/)

> 🔗 **[https://dinos-proj.vercel.app/](https://dinos-proj.vercel.app/)**

---

## ✨ Features

### 🔐 Authentication
- 3D flip-card login/register interface
- Holographic particle explosion transition
- Post-login animated orb transition

### 📊 Dashboard
- Interactive 3D Quasar (Explore) and Galaxy (Research) objects
- Particle-based holographic text labels (3500+ particles per label)
- Click-to-navigate 3D elements with hover animations

### 🔬 Geometry Lab (Explore)
- **Full 3D Modeler** — Add, move, rotate, scale shapes in real-time
- **10 Primitive Shapes** — Cube, Sphere, Cylinder, Cone, Torus, Plane, Dodecahedron, Torus Knot, Icosahedron, Octahedron
- **WASD Object Movement** — Move selected objects with keyboard (constrained to XZ/XY/YZ planes)
- **Transform Gizmos** — Full translate/rotate/scale controls via Three.js TransformControls
- **Point Plotting System** — Click to place points, auto-build geometry:
  - 2 points → Line
  - 3 points → Triangle
  - 4-7 points → Surface
  - 8+ points → Solid
- **Properties Panel** — Live-edit position, rotation, scale, dimensions, color
- **Mathematical Equations** — Real-time formulas (volume, surface area, parametric equations) for each shape
- **Scene Hierarchy** — Object list with click-to-select
- **Coordinate Tracker** — Live XYZ display during drag operations
- **Precision Grid** — Dual-layer grid with snap-to-grid point placement

### 📋 Research (Phases)
- Phase management system with progress tracking
- Image upload via Cloudinary integration
- Glassmorphic dark-themed UI

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **Three.js** | 3D Rendering Engine |
| **Vite 8** | Build Tool & Dev Server |
| **Cloudinary** | Image Hosting |
| **Firebase** | Backend Services |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🏗️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**

---

## 📁 Project Structure

```
├── public/
│   ├── media/          # Video/GIF assets (quasar, galaxy)
│   ├── phases.json     # Phase data
│   └── users.json      # User credentials store
├── src/
│   ├── App.jsx         # Main router & page management
│   ├── App.css         # Global layout & transitions
│   ├── Login3D.jsx     # 3D flip-card authentication
│   ├── Dashboard3DObjects.jsx  # Holographic 3D dashboard
│   ├── ShapesGallery.jsx       # Full 3D geometry modeler
│   ├── PhasesPage.jsx  # Research phase management
│   ├── ParticleButton.jsx      # Animated start button
│   ├── TesseractButton.jsx     # 4D tesseract animation
│   ├── cloudinary.js   # Cloudinary config
│   ├── firebase.js     # Firebase config
│   └── images/         # Static images
├── index.html
├── vite.config.js
└── package.json
```

---

## ⌨️ Keyboard Shortcuts (Geometry Lab)

| Key | Action |
|---|---|
| `W/A/S/D` | Move selected object (or camera if nothing selected) |
| `Q/E` | Move up/down |
| `Shift` | Fast movement (2.5x) |
| `Click` | Select object |
| `Click empty` | Deselect (unlock camera) |
| `Scroll` | Zoom in/out |
| `Drag` | Orbit camera (when no object selected) |

---

## 🎨 Design Philosophy

- **Holographic Aesthetic** — Neon-cyan (#00ffff) color palette throughout
- **Glassmorphism** — Frosted glass panels with backdrop blur
- **Dark Mode First** — Deep space background (#0a0a14)
- **Particle Systems** — High-density BufferGeometry particle rendering
- **Micro-animations** — Hover effects, pulsing glows, smooth transitions

---

## 📄 License

MIT License — feel free to use and modify.

---

<p align="center">
  Built with 💎 React + Three.js
</p>

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import './ShapesGallery.css';

const SHAPE_TYPES = [
  { id: 'cube', label: 'Cube', icon: '⬜' },
  { id: 'sphere', label: 'Sphere', icon: '🔵' },
  { id: 'cylinder', label: 'Cylinder', icon: '🔷' },
  { id: 'cone', label: 'Cone', icon: '🔺' },
  { id: 'torus', label: 'Torus', icon: '⭕' },
  { id: 'plane', label: 'Plane', icon: '▬' },
  { id: 'dodecahedron', label: 'Dodecahedron', icon: '⬡' },
  { id: 'torusknot', label: 'Torus Knot', icon: '∞' },
  { id: 'icosahedron', label: 'Icosahedron', icon: '◆' },
  { id: 'octahedron', label: 'Octahedron', icon: '◇' },
];

function createGeometry(type, dims) {
  switch (type) {
    case 'cube': return new THREE.BoxGeometry(dims.width, dims.height, dims.depth);
    case 'sphere': return new THREE.SphereGeometry(dims.radius, 32, 32);
    case 'cylinder': return new THREE.CylinderGeometry(dims.radiusTop, dims.radiusBottom, dims.height, 32);
    case 'cone': return new THREE.ConeGeometry(dims.radius, dims.height, 32);
    case 'torus': return new THREE.TorusGeometry(dims.radius, dims.tube, 16, 48);
    case 'plane': return new THREE.PlaneGeometry(dims.width, dims.height);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(dims.radius);
    case 'torusknot': return new THREE.TorusKnotGeometry(dims.radius, dims.tube, 100, 16);
    case 'icosahedron': return new THREE.IcosahedronGeometry(dims.radius);
    case 'octahedron': return new THREE.OctahedronGeometry(dims.radius);
    default: return new THREE.BoxGeometry(1, 1, 1);
  }
}

function getDefaultDims(type) {
  switch (type) {
    case 'cube': return { width: 1, height: 1, depth: 1 };
    case 'sphere': return { radius: 0.7 };
    case 'cylinder': return { radiusTop: 0.5, radiusBottom: 0.5, height: 1.2 };
    case 'cone': return { radius: 0.6, height: 1.2 };
    case 'torus': return { radius: 0.5, tube: 0.2 };
    case 'plane': return { width: 2, height: 2 };
    case 'dodecahedron': return { radius: 0.7 };
    case 'torusknot': return { radius: 0.5, tube: 0.15 };
    case 'icosahedron': return { radius: 0.7 };
    case 'octahedron': return { radius: 0.7 };
    default: return { width: 1, height: 1, depth: 1 };
  }
}

function getDimFields(type) {
  switch (type) {
    case 'cube': return ['width', 'height', 'depth'];
    case 'sphere': return ['radius'];
    case 'cylinder': return ['radiusTop', 'radiusBottom', 'height'];
    case 'cone': return ['radius', 'height'];
    case 'torus': return ['radius', 'tube'];
    case 'plane': return ['width', 'height'];
    case 'dodecahedron': return ['radius'];
    case 'torusknot': return ['radius', 'tube'];
    case 'icosahedron': return ['radius'];
    case 'octahedron': return ['radius'];
    default: return [];
  }
}

function getShapeEquation(type, dims) {
  switch (type) {
    case 'cube': {
      const w = dims.width || 1, h = dims.height || 1, d = dims.depth || 1;
      return {
        name: 'Rectangular Prism',
        eqs: [
          `V = w × h × d = ${(w*h*d).toFixed(2)}`,
          `SA = 2(wh + hd + wd) = ${(2*(w*h + h*d + w*d)).toFixed(2)}`,
          `|x| ≤ ${(w/2).toFixed(2)}, |y| ≤ ${(h/2).toFixed(2)}, |z| ≤ ${(d/2).toFixed(2)}`
        ]
      };
    }
    case 'sphere': {
      const r = dims.radius || 0.7;
      return {
        name: 'Sphere',
        eqs: [
          `x² + y² + z² = r²`,
          `r = ${r.toFixed(2)}`,
          `V = (4/3)πr³ = ${((4/3)*Math.PI*r*r*r).toFixed(2)}`,
          `SA = 4πr² = ${(4*Math.PI*r*r).toFixed(2)}`
        ]
      };
    }
    case 'cylinder': {
      const rt = dims.radiusTop || 0.5, rb = dims.radiusBottom || 0.5, h = dims.height || 1.2;
      return {
        name: 'Cylinder',
        eqs: [
          `x² + z² ≤ r²,  0 ≤ y ≤ h`,
          `r₁ = ${rt.toFixed(2)}, r₂ = ${rb.toFixed(2)}, h = ${h.toFixed(2)}`,
          `V = (π/3)h(r₁² + r₂² + r₁r₂) = ${((Math.PI/3)*h*(rt*rt+rb*rb+rt*rb)).toFixed(2)}`
        ]
      };
    }
    case 'cone': {
      const r = dims.radius || 0.6, h = dims.height || 1.2;
      return {
        name: 'Cone',
        eqs: [
          `x² + z² ≤ (r(1 - y/h))²`,
          `r = ${r.toFixed(2)}, h = ${h.toFixed(2)}`,
          `V = (1/3)πr²h = ${((1/3)*Math.PI*r*r*h).toFixed(2)}`,
          `SA = πr(r + √(h²+r²)) = ${(Math.PI*r*(r+Math.sqrt(h*h+r*r))).toFixed(2)}`
        ]
      };
    }
    case 'torus': {
      const R = dims.radius || 0.5, r = dims.tube || 0.2;
      return {
        name: 'Torus',
        eqs: [
          `(√(x²+z²) - R)² + y² = r²`,
          `R = ${R.toFixed(2)}, r = ${r.toFixed(2)}`,
          `V = 2π²Rr² = ${(2*Math.PI*Math.PI*R*r*r).toFixed(2)}`,
          `SA = 4π²Rr = ${(4*Math.PI*Math.PI*R*r).toFixed(2)}`
        ]
      };
    }
    case 'plane': {
      const w = dims.width || 2, h = dims.height || 2;
      return {
        name: 'Plane',
        eqs: [
          `y = 0  (XZ plane)`,
          `w = ${w.toFixed(2)}, h = ${h.toFixed(2)}`,
          `A = w × h = ${(w*h).toFixed(2)}`
        ]
      };
    }
    case 'dodecahedron': {
      const r = dims.radius || 0.7;
      return {
        name: 'Dodecahedron',
        eqs: [
          `12 pentagonal faces`,
          `r = ${r.toFixed(2)}`,
          `V = (15+7√5)/4 × a³`,
          `a ≈ ${(r * 4 / (Math.sqrt(3) * (1 + Math.sqrt(5)))).toFixed(3)}`
        ]
      };
    }
    case 'torusknot': {
      const R = dims.radius || 0.5, r = dims.tube || 0.15;
      return {
        name: 'Torus Knot (p=2, q=3)',
        eqs: [
          `x = (R + r·cos(qt))·cos(pt)`,
          `y = (R + r·cos(qt))·sin(pt)`,
          `z = r·sin(qt)`,
          `R = ${R.toFixed(2)}, r = ${r.toFixed(2)}`
        ]
      };
    }
    case 'icosahedron': {
      const r = dims.radius || 0.7;
      return {
        name: 'Icosahedron',
        eqs: [
          `20 equilateral triangular faces`,
          `r = ${r.toFixed(2)}`,
          `V = (5/12)(3+√5)a³`,
          `a ≈ ${(r / Math.sin(2 * Math.PI / 5)).toFixed(3)}`
        ]
      };
    }
    case 'octahedron': {
      const r = dims.radius || 0.7;
      return {
        name: 'Octahedron',
        eqs: [
          `|x| + |y| + |z| ≤ a`,
          `8 equilateral triangular faces`,
          `r = ${r.toFixed(2)}`,
          `V = (√2/3)a³ = ${((Math.SQRT2/3)*Math.pow(r*Math.SQRT2,3)).toFixed(2)}`
        ]
      };
    }
    case 'plotted': return { name: 'Custom Geometry', eqs: ['User-defined vertices'] };
    default: return { name: type, eqs: [] };
  }
}

// Determine what can be built from N points
function getPlotInfo(count) {
  if (count === 0) return { hint: 'Click on grid to place points', canBuild: null };
  if (count === 1) return { hint: '1 point — need 1 more for LINE', canBuild: null };
  if (count === 2) return { hint: '2 points → LINE ready', canBuild: 'line' };
  if (count === 3) return { hint: '3 points → TRIANGLE ready', canBuild: 'triangle' };
  if (count >= 4 && count < 8) return { hint: `${count} points → SURFACE ready (add more for cube at 8)`, canBuild: 'surface' };
  if (count >= 8) return { hint: `${count} points → SOLID ready`, canBuild: 'solid' };
  return { hint: '', canBuild: null };
}

export default function ShapesGallery({ onBack }) {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const keysRef = useRef({});
  const plotModeRef = useRef(false);
  const selectedIdRef = useRef(null);
  const movePlaneRef = useRef('xz');

  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedProps, setSelectedProps] = useState(null);
  const [plotMode, setPlotMode] = useState(false);
  const [plotPoints, setPlotPoints] = useState([]);
  const [dragCoords, setDragCoords] = useState(null);
  const [movePlane, setMovePlane] = useState('xz');

  // Keep refs in sync with state
  useEffect(() => { plotModeRef.current = plotMode; }, [plotMode]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { movePlaneRef.current = movePlane; }, [movePlane]);

  const syncSelectedProps = useCallback((id) => {
    const engine = engineRef.current;
    if (!engine || !id) { setSelectedProps(null); return; }
    const entry = engine.shapesMap.get(id);
    if (!entry) { setSelectedProps(null); return; }
    const m = entry.mesh;
    setSelectedProps({
      id, type: entry.type, dims: { ...entry.dims },
      position: { x: +m.position.x.toFixed(2), y: +m.position.y.toFixed(2), z: +m.position.z.toFixed(2) },
      rotation: {
        x: +(THREE.MathUtils.radToDeg(m.rotation.x)).toFixed(1),
        y: +(THREE.MathUtils.radToDeg(m.rotation.y)).toFixed(1),
        z: +(THREE.MathUtils.radToDeg(m.rotation.z)).toFixed(1),
      },
      scale: { x: +m.scale.x.toFixed(2), y: +m.scale.y.toFixed(2), z: +m.scale.z.toFixed(2) },
    });
  }, []);

  // ==============================
  // Three.js Engine Init
  // ==============================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 500);
    camera.position.set(6, 5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a14, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Orbit Controls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.minDistance = 2;
    orbit.maxDistance = 50;

    // Transform Controls
    const transform = new TransformControls(camera, renderer.domElement);
    transform.setSize(0.8);
    scene.add(transform);
    transform.addEventListener('dragging-changed', (e) => {
      // Only allow orbit when not dragging gizmo AND no object selected
      orbit.enabled = !e.value && !selectedIdRef.current;
      if (!e.value) setDragCoords(null); // clear coords when drag ends
    });
    transform.addEventListener('objectChange', () => {
      if (transform.object && transform.object.userData.shapeId) {
        syncSelectedProps(transform.object.userData.shapeId);
        // Live coordinate tracking during drag
        const p = transform.object.position;
        setDragCoords({
          x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2)
        });
      }
    });

    // Grid — main grid lines
    const gridSize = 40;
    const grid = new THREE.GridHelper(gridSize, 40, 0x888888, 0x444444);
    grid.material.opacity = 0.7;
    grid.material.transparent = true;
    scene.add(grid);

    // Sub-grid — finer divisions for precision
    const subGrid = new THREE.GridHelper(gridSize, 200, 0x333333, 0x222222);
    subGrid.material.opacity = 0.4;
    subGrid.material.transparent = true;
    subGrid.position.y = -0.005;
    scene.add(subGrid);

    // Axis lines
    const axesMat = (color) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const makeAxis = (color, end) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), end]);
      return new THREE.Line(geo, axesMat(color));
    };
    scene.add(makeAxis(0xff4444, new THREE.Vector3(20, 0, 0)));
    scene.add(makeAxis(0x44ff44, new THREE.Vector3(0, 20, 0)));
    scene.add(makeAxis(0x4444ff, new THREE.Vector3(0, 0, 20)));

    // Lighting
    scene.add(new THREE.AmbientLight(0x334455, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);
    scene.add(new THREE.DirectionalLight(0x00ffff, 0.3).translateX(-5).translateY(5).translateZ(-5));
    scene.add(new THREE.HemisphereLight(0x0044aa, 0x002211, 0.4));

    // Ground plane (for raycasting & shadows)
    const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize);
    const groundMat = new THREE.MeshBasicMaterial({ visible: false });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    groundPlane.name = 'groundPlane';
    scene.add(groundPlane);

    // Shadow ground
    const shadowGround = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    shadowGround.rotation.x = -Math.PI / 2;
    shadowGround.position.y = -0.01;
    shadowGround.receiveShadow = true;
    scene.add(shadowGround);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const shapesMap = new Map();
    let nextId = 1;

    // Plot mode data stored in engine
    const plotData = {
      markers: [],       // THREE.Mesh point markers
      previewLines: [],  // THREE.Line preview connections
      previewGroup: new THREE.Group(),
    };
    scene.add(plotData.previewGroup);

    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff, side: THREE.BackSide, transparent: true, opacity: 0.4,
    });

    const engine = {
      scene, camera, renderer, orbit, transform,
      shapesMap, raycaster, mouse, groundPlane, outlineMaterial, plotData,
      getNextId: () => nextId++,
    };
    engineRef.current = engine;

    // ==============================
    // WASD + QE Movement
    // ==============================
    const onKeyDown = (e) => {
      // Don't capture if typing in input
      if (e.target.tagName === 'INPUT') return;
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ==============================
    // Click handler (select or plot)
    // ==============================
    const onPointerDown = (e) => {
      if (transform.dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // PLOT MODE: place point on grid
      if (plotModeRef.current) {
        const hits = raycaster.intersectObject(groundPlane, false);
        if (hits.length > 0) {
          const pt = hits[0].point;
          // Snap to grid (0.5 intervals)
          const snapped = new THREE.Vector3(
            Math.round(pt.x * 2) / 2,
            0,
            Math.round(pt.z * 2) / 2
          );

          // Create marker sphere
          const markerGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({
            color: 0xff4488,
            transparent: true,
            opacity: 0.9,
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.copy(snapped);
          plotData.previewGroup.add(marker);
          plotData.markers.push(marker);

          // Add glow ring
          const ringGeo = new THREE.RingGeometry(0.15, 0.22, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff4488, transparent: true, opacity: 0.5,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.copy(snapped);
          ring.position.y = 0.01;
          plotData.previewGroup.add(ring);

          // Update preview lines
          updatePlotPreview(plotData);

          // Update React state
          setPlotPoints(prev => [...prev, {
            x: +snapped.x.toFixed(2),
            y: +snapped.y.toFixed(2),
            z: +snapped.z.toFixed(2),
          }]);
        }
        return;
      }

      // Normal select mode
      const meshes = [];
      shapesMap.forEach(entry => meshes.push(entry.mesh));
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        setSelectedId(hits[0].object.userData.shapeId);
      } else {
        setSelectedId(null);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // ==============================
    // Preview lines between plotted points
    // ==============================
    function updatePlotPreview(pd) {
      // Remove old preview lines
      pd.previewLines.forEach(l => pd.previewGroup.remove(l));
      pd.previewLines = [];

      if (pd.markers.length < 2) return;

      const positions = pd.markers.map(m => m.position);

      // Draw lines connecting sequential points
      for (let i = 0; i < positions.length - 1; i++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[i + 1]]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xff4488, transparent: true, opacity: 0.7,
          depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        pd.previewGroup.add(line);
        pd.previewLines.push(line);
      }

      // Close the shape if 3+ points
      if (positions.length >= 3) {
        const closeGeo = new THREE.BufferGeometry().setFromPoints([
          positions[positions.length - 1], positions[0]
        ]);
        const closeMat = new THREE.LineBasicMaterial({
          color: 0xff4488, transparent: true, opacity: 0.35,
          depthWrite: false,
        });
        const closeLine = new THREE.Line(closeGeo, closeMat);
        pd.previewGroup.add(closeLine);
        pd.previewLines.push(closeLine);
      }
    }

    // ==============================
    // Animation loop with WASD
    // ==============================
    let animId;
    const moveSpeed = 0.12;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const keys = keysRef.current;

      // WASD: move selected object, or camera if nothing selected
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

      const speed = moveSpeed * (keys['shift'] ? 2.5 : 1);
      const selId = selectedIdRef.current;
      const selEntry = selId ? engine.shapesMap.get(selId) : null;

      if (selEntry && selEntry.mesh) {
        // Move selected object constrained to selected plane
        const obj = selEntry.mesh;
        const plane = movePlaneRef.current;
        const canX = plane.includes('x');
        const canY = plane.includes('y');
        const canZ = plane.includes('z');
        if (keys['w']) { if (canZ) obj.position.z -= speed; else if (canY) obj.position.y += speed; }
        if (keys['s']) { if (canZ) obj.position.z += speed; else if (canY) obj.position.y -= speed; }
        if (keys['a'] && canX) obj.position.x -= speed;
        if (keys['d'] && canX) obj.position.x += speed;
        if (keys['q'] && canY) obj.position.y -= speed;
        if (keys['e'] && canY) obj.position.y += speed;
        // Sync properties panel if moving
        if (keys['w'] || keys['s'] || keys['a'] || keys['d'] || keys['q'] || keys['e']) {
          syncSelectedProps(selId);
        }
      } else {
        // Move camera when nothing is selected
        if (keys['w']) {
          camera.position.addScaledVector(forward, speed);
          orbit.target.addScaledVector(forward, speed);
        }
        if (keys['s']) {
          camera.position.addScaledVector(forward, -speed);
          orbit.target.addScaledVector(forward, -speed);
        }
        if (keys['a']) {
          camera.position.addScaledVector(right, -speed);
          orbit.target.addScaledVector(right, -speed);
        }
        if (keys['d']) {
          camera.position.addScaledVector(right, speed);
          orbit.target.addScaledVector(right, speed);
        }
        if (keys['q']) {
          camera.position.y -= speed;
          orbit.target.y -= speed;
        }
        if (keys['e']) {
          camera.position.y += speed;
          orbit.target.y += speed;
        }
      }

      // Animate plot markers glow
      const pd = engine.plotData;
      const elapsed = performance.now() / 1000;
      pd.markers.forEach((m, i) => {
        const pulse = 0.8 + Math.sin(elapsed * 3 + i) * 0.2;
        m.material.opacity = pulse;
        m.scale.setScalar(0.9 + Math.sin(elapsed * 2 + i * 0.5) * 0.15);
      });

      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      transform.dispose();
      orbit.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync transform mode & plane constraint
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.transform.setMode(transformMode);
    // Constrain axes based on selected plane (only in translate mode)
    if (transformMode === 'translate') {
      engine.transform.showX = movePlane.includes('x');
      engine.transform.showY = movePlane.includes('y');
      engine.transform.showZ = movePlane.includes('z');
    } else {
      engine.transform.showX = true;
      engine.transform.showY = true;
      engine.transform.showZ = true;
    }
  }, [transformMode, movePlane]);

  // Sync selection — lock camera when object selected
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // Reset all outlines and edge highlights
    engine.shapesMap.forEach(entry => {
      if (entry.outline) entry.outline.visible = false;
      if (entry.edgeHighlight) entry.edgeHighlight.visible = false;
    });

    if (selectedId) {
      const entry = engine.shapesMap.get(selectedId);
      if (entry) {
        engine.transform.attach(entry.mesh);
        if (entry.outline) entry.outline.visible = true;

        // Create/show edge highlight for clear selection
        if (!entry.edgeHighlight) {
          const edges = new THREE.EdgesGeometry(entry.mesh.geometry, 15);
          const edgeMat = new THREE.LineBasicMaterial({
            color: 0x00ffff, transparent: true, opacity: 0.9,
            depthWrite: false,
          });
          entry.edgeHighlight = new THREE.LineSegments(edges, edgeMat);
          entry.mesh.add(entry.edgeHighlight);
        }
        entry.edgeHighlight.visible = true;

        syncSelectedProps(selectedId);
      }
      // Lock camera when object is selected
      engine.orbit.enabled = false;
    } else {
      engine.transform.detach();
      setSelectedProps(null);
      setDragCoords(null);
      // Unlock camera when deselected
      engine.orbit.enabled = true;
    }
  }, [selectedId, syncSelectedProps]);

  // ==============================
  // Add shape
  // ==============================
  const handleAddShape = useCallback((type) => {
    const engine = engineRef.current;
    if (!engine) return;
    const id = `shape_${engine.getNextId()}`;
    const dims = getDefaultDims(type);
    const geo = createGeometry(type, dims);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x00ccdd, emissive: 0x002233, emissiveIntensity: 0.15,
      shininess: 80, transparent: true, opacity: 0.85,
      side: type === 'plane' ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set((Math.random() - 0.5) * 4, type === 'plane' ? 0.01 : 0.8, (Math.random() - 0.5) * 4);
    mesh.userData.shapeId = id;
    engine.scene.add(mesh);

    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15, depthWrite: false })
    );
    mesh.add(wireframe);

    const outline = new THREE.Mesh(geo.clone(), engine.outlineMaterial.clone());
    outline.scale.set(1.04, 1.04, 1.04);
    outline.visible = false;
    mesh.add(outline);

    engine.shapesMap.set(id, { mesh, wireframe, outline, type, dims });
    setShapes(prev => [...prev, { id, type, label: SHAPE_TYPES.find(s => s.id === type)?.label || type }]);
    setSelectedId(id);
    setShowAddMenu(false);
  }, []);

  // Delete
  const handleDelete = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !selectedId) return;
    const entry = engine.shapesMap.get(selectedId);
    if (entry) {
      engine.transform.detach();
      engine.scene.remove(entry.mesh);
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
      engine.shapesMap.delete(selectedId);
    }
    setShapes(prev => prev.filter(s => s.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  // Duplicate
  const handleDuplicate = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !selectedId) return;
    const entry = engine.shapesMap.get(selectedId);
    if (!entry) return;
    const id = `shape_${engine.getNextId()}`;
    const dims = { ...entry.dims };
    const geo = createGeometry(entry.type, dims);
    const mat = entry.mesh.material.clone();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(entry.mesh.position).add(new THREE.Vector3(1.5, 0, 1.5));
    mesh.rotation.copy(entry.mesh.rotation);
    mesh.scale.copy(entry.mesh.scale);
    mesh.userData.shapeId = id;
    engine.scene.add(mesh);
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15, depthWrite: false })
    );
    mesh.add(wireframe);
    const outline = new THREE.Mesh(geo.clone(), engine.outlineMaterial.clone());
    outline.scale.set(1.04, 1.04, 1.04);
    outline.visible = false;
    mesh.add(outline);
    engine.shapesMap.set(id, { mesh, wireframe, outline, type: entry.type, dims });
    setShapes(prev => [...prev, { id, type: entry.type, label: SHAPE_TYPES.find(s => s.id === entry.type)?.label || entry.type }]);
    setSelectedId(id);
  }, [selectedId]);

  // Dimension change
  const handleDimChange = useCallback((field, value) => {
    const engine = engineRef.current;
    if (!engine || !selectedId) return;
    const entry = engine.shapesMap.get(selectedId);
    if (!entry) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) return;
    entry.dims[field] = numVal;
    const newGeo = createGeometry(entry.type, entry.dims);
    entry.mesh.geometry.dispose();
    entry.mesh.geometry = newGeo;
    entry.mesh.remove(entry.wireframe);
    entry.wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(newGeo),
      new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15, depthWrite: false })
    );
    entry.mesh.add(entry.wireframe);
    entry.mesh.remove(entry.outline);
    entry.outline = new THREE.Mesh(newGeo.clone(), engine.outlineMaterial.clone());
    entry.outline.scale.set(1.04, 1.04, 1.04);
    entry.outline.visible = true;
    entry.mesh.add(entry.outline);
    syncSelectedProps(selectedId);
  }, [selectedId, syncSelectedProps]);

  // Transform change
  const handleTransformChange = useCallback((prop, axis, value) => {
    const engine = engineRef.current;
    if (!engine || !selectedId) return;
    const entry = engine.shapesMap.get(selectedId);
    if (!entry) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    if (prop === 'position') entry.mesh.position[axis] = numVal;
    if (prop === 'rotation') entry.mesh.rotation[axis] = THREE.MathUtils.degToRad(numVal);
    if (prop === 'scale') entry.mesh.scale[axis] = Math.max(0.01, numVal);
    syncSelectedProps(selectedId);
  }, [selectedId, syncSelectedProps]);

  // Color change
  const handleColorChange = useCallback((color) => {
    const engine = engineRef.current;
    if (!engine || !selectedId) return;
    const entry = engine.shapesMap.get(selectedId);
    if (entry) entry.mesh.material.color.set(color);
  }, [selectedId]);

  // ==============================
  // PLOT: Build geometry from points
  // ==============================
  const handlePlotBuild = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || plotPoints.length < 2) return;

    const id = `plot_${engine.getNextId()}`;
    const pts = plotPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
    let mesh;

    if (pts.length === 2) {
      // LINE
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
      mesh = new THREE.Line(geo, mat);
      mesh.userData.shapeId = id;

    } else if (pts.length === 3) {
      // TRIANGLE
      const geo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        pts[0].x, pts[0].y, pts[0].z,
        pts[1].x, pts[1].y, pts[1].z,
        pts[2].x, pts[2].y, pts[2].z,
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geo.setIndex([0, 1, 2]);
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhongMaterial({
        color: 0x00ffcc, emissive: 0x002222,
        transparent: true, opacity: 0.8,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.userData.shapeId = id;

      // Add wireframe edges
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
      mesh.add(new THREE.LineSegments(edges, edgeMat));

    } else if (pts.length >= 4 && pts.length < 8) {
      // SURFACE from multiple points (triangulated)
      const geo = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      pts.forEach(p => vertices.push(p.x, p.y, p.z));
      // Fan triangulation from first point
      for (let i = 1; i < pts.length - 1; i++) {
        indices.push(0, i, i + 1);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhongMaterial({
        color: 0x44aaff, emissive: 0x112233,
        transparent: true, opacity: 0.75,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.userData.shapeId = id;

      const edges = new THREE.EdgesGeometry(geo);
      mesh.add(new THREE.LineSegments(edges,
        new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
      ));

    } else {
      // SOLID from 8+ points (convex hull approximation)
      // Build faces by connecting top 4 and bottom 4
      const geo = new THREE.BufferGeometry();
      const sorted = [...pts].sort((a, b) => a.y - b.y);
      const bottom = sorted.slice(0, 4);
      const top = sorted.slice(4, 8);

      // Sort each group by angle from centroid for consistent winding
      const sortByAngle = (arr) => {
        const cx = arr.reduce((s, p) => s + p.x, 0) / arr.length;
        const cz = arr.reduce((s, p) => s + p.z, 0) / arr.length;
        return arr.sort((a, b) => Math.atan2(a.z - cz, a.x - cx) - Math.atan2(b.z - cz, b.x - cx));
      };
      sortByAngle(bottom);
      sortByAngle(top);

      const verts = [];
      [...bottom, ...top].forEach(p => verts.push(p.x, p.y, p.z));

      // Bottom: 0,1,2,3  Top: 4,5,6,7
      const idx = [
        0, 1, 2, 0, 2, 3,       // bottom
        4, 6, 5, 4, 7, 6,       // top
        0, 4, 5, 0, 5, 1,       // front
        2, 6, 7, 2, 7, 3,       // back
        0, 3, 7, 0, 7, 4,       // left
        1, 5, 6, 1, 6, 2,       // right
      ];
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color: 0xff8844, emissive: 0x331100,
        transparent: true, opacity: 0.8,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.userData.shapeId = id;

      const edges = new THREE.EdgesGeometry(geo);
      mesh.add(new THREE.LineSegments(edges,
        new THREE.LineBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.6 })
      ));
    }

    engine.scene.add(mesh);
    mesh.castShadow = true;
    if (mesh.receiveShadow !== undefined) mesh.receiveShadow = true;

    const typeLabel = pts.length === 2 ? 'Line' : pts.length === 3 ? 'Triangle' : pts.length < 8 ? 'Surface' : 'Solid';
    engine.shapesMap.set(id, { mesh, wireframe: null, outline: null, type: 'plotted', dims: {} });
    setShapes(prev => [...prev, { id, type: 'plotted', label: `${typeLabel} (${pts.length}pts)` }]);
    setSelectedId(id);

    // Clear plot state
    handlePlotClear();
  }, [plotPoints]);

  // Clear plot points
  const handlePlotClear = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const pd = engine.plotData;
    // Remove all markers and lines
    while (pd.previewGroup.children.length > 0) {
      pd.previewGroup.remove(pd.previewGroup.children[0]);
    }
    pd.markers = [];
    pd.previewLines = [];
    setPlotPoints([]);
  }, []);

  // Undo last point
  const handlePlotUndo = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || plotPoints.length === 0) return;
    const pd = engine.plotData;
    // Remove last marker and its ring
    if (pd.markers.length > 0) {
      const lastMarker = pd.markers.pop();
      pd.previewGroup.remove(lastMarker);
      // Remove associated ring (it's the child added right after marker)
      // We'll just rebuild all preview lines
    }
    // Remove preview lines and rebuild
    pd.previewLines.forEach(l => pd.previewGroup.remove(l));
    pd.previewLines = [];
    // Remove last ring (rings are even-indexed children after markers removal adjusts)
    // Simpler: clear all non-marker children and rebuild
    const markersLeft = [...pd.markers];
    while (pd.previewGroup.children.length > 0) {
      pd.previewGroup.remove(pd.previewGroup.children[0]);
    }
    pd.markers = [];
    // Re-add remaining markers
    markersLeft.forEach(m => {
      pd.previewGroup.add(m);
      pd.markers.push(m);
      // Re-add ring
      const ringGeo = new THREE.RingGeometry(0.15, 0.22, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff4488, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(m.position);
      ring.position.y = 0.01;
      pd.previewGroup.add(ring);
    });
    // Rebuild preview lines
    if (pd.markers.length >= 2) {
      const positions = pd.markers.map(m => m.position);
      for (let i = 0; i < positions.length - 1; i++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[i + 1]]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
          color: 0xff4488, transparent: true, opacity: 0.7, depthWrite: false,
        }));
        pd.previewGroup.add(line);
        pd.previewLines.push(line);
      }
      if (positions.length >= 3) {
        const closeGeo = new THREE.BufferGeometry().setFromPoints([positions[positions.length - 1], positions[0]]);
        const closeLine = new THREE.Line(closeGeo, new THREE.LineBasicMaterial({
          color: 0xff4488, transparent: true, opacity: 0.35, depthWrite: false,
        }));
        pd.previewGroup.add(closeLine);
        pd.previewLines.push(closeLine);
      }
    }
    setPlotPoints(prev => prev.slice(0, -1));
  }, [plotPoints]);

  const plotInfo = getPlotInfo(plotPoints.length);

  // ==============================
  // JSX
  // ==============================
  return (
    <div className="sg-container">
      {/* ===== TOP NAVBAR ===== */}
      <nav className="sg-navbar">
        <div className="sg-nav-left">
          <button className="sg-nav-btn sg-back-btn" onClick={onBack}>←</button>

          {/* Add Shapes */}
          <div className="sg-add-wrapper">
            <button
              className={`sg-nav-btn sg-add-btn ${showAddMenu ? 'active' : ''}`}
              onClick={() => { setShowAddMenu(!showAddMenu); setPlotMode(false); }}
            >
              + ADD
            </button>
            {showAddMenu && (
              <div className="sg-add-dropdown">
                {SHAPE_TYPES.map(s => (
                  <button key={s.id} className="sg-dropdown-item" onClick={() => handleAddShape(s.id)}>
                    <span className="sg-dropdown-icon">{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plot Mode Toggle */}
          <button
            className={`sg-nav-btn sg-plot-btn ${plotMode ? 'active' : ''}`}
            onClick={() => { setPlotMode(!plotMode); setShowAddMenu(false); if (!plotMode) setSelectedId(null); }}
          >
            ✏ PLOT
          </button>

          <div className="sg-nav-divider" />

          {/* Transform modes */}
          <div className="sg-mode-group">
            <button className={`sg-mode-btn ${transformMode === 'translate' ? 'active' : ''}`}
              onClick={() => setTransformMode('translate')} title="Move">✥</button>
            <button className={`sg-mode-btn ${transformMode === 'rotate' ? 'active' : ''}`}
              onClick={() => setTransformMode('rotate')} title="Rotate">↻</button>
            <button className={`sg-mode-btn ${transformMode === 'scale' ? 'active' : ''}`}
              onClick={() => setTransformMode('scale')} title="Scale">⤢</button>
          </div>
        </div>

        <div className="sg-nav-center">
          <span className="sg-title">GEOMETRY_LAB</span>
        </div>

        <div className="sg-nav-right">
          {selectedId && !plotMode && (
            <>
              <button className="sg-nav-btn sg-dup-btn" onClick={handleDuplicate}>⧉ DUPLICATE</button>
              <button className="sg-nav-btn sg-del-btn" onClick={handleDelete}>✕ DELETE</button>
            </>
          )}
          <span className="sg-obj-count">{shapes.length} objects</span>
        </div>
      </nav>

      {/* ===== 3D VIEWPORT ===== */}
      <div ref={mountRef} className={`sg-viewport ${plotMode ? 'plot-cursor' : ''}`} />

      {/* ===== LIVE COORDINATE TRACKER ===== */}
      {dragCoords && (
        <div className="sg-drag-coords">
          <span className="sg-dc-label">POSITION</span>
          <span className="sg-dc-axis sg-axis-x">X: {dragCoords.x}</span>
          <span className="sg-dc-axis sg-axis-y">Y: {dragCoords.y}</span>
          <span className="sg-dc-axis sg-axis-z">Z: {dragCoords.z}</span>
        </div>
      )}

      {/* ===== SCENE HIERARCHY (left) ===== */}
      <div className="sg-hierarchy">
        <div className="sg-panel-header">SCENE HIERARCHY</div>
        {shapes.length === 0 ? (
          <div className="sg-hierarchy-empty">No objects yet<br />Click "+ ADD SHAPE"<br />or use PLOT POINTS</div>
        ) : (
          <div className="sg-hierarchy-list">
            {shapes.map(s => (
              <button key={s.id}
                className={`sg-hierarchy-item ${selectedId === s.id ? 'selected' : ''}`}
                onClick={() => { setSelectedId(s.id); setPlotMode(false); }}
              >
                <span className="sg-h-icon">{SHAPE_TYPES.find(t => t.id === s.type)?.icon || '📐'}</span>
                <span className="sg-h-name">{s.label}</span>
                <span className="sg-h-id">{s.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== PLOT MODE PANEL (right, when plotting) ===== */}
      {plotMode && (
        <div className="sg-properties sg-plot-panel">
          <div className="sg-panel-header">PLOT MODE</div>
          <div className="sg-props-content">
            <div className="sg-plot-hint">{plotInfo.hint}</div>

            {/* Points list */}
            {plotPoints.length > 0 && (
              <div className="sg-plot-points">
                <div className="sg-prop-label">PLACED POINTS</div>
                {plotPoints.map((p, i) => (
                  <div key={i} className="sg-plot-point-row">
                    <span className="sg-plot-point-num">P{i + 1}</span>
                    <span className="sg-plot-coord">({p.x}, {p.y}, {p.z})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="sg-plot-actions">
              {plotInfo.canBuild && (
                <button className="sg-nav-btn sg-plot-build-btn" onClick={handlePlotBuild}>
                  ⚡ BUILD {plotInfo.canBuild.toUpperCase()}
                </button>
              )}
              {plotPoints.length > 0 && (
                <>
                  <button className="sg-nav-btn sg-plot-undo-btn" onClick={handlePlotUndo}>
                    ↩ UNDO POINT
                  </button>
                  <button className="sg-nav-btn sg-del-btn" onClick={handlePlotClear}>
                    ✕ CLEAR ALL
                  </button>
                </>
              )}
            </div>

            <div className="sg-plot-legend">
              <div className="sg-prop-label" style={{ marginTop: 16 }}>BUILD GUIDE</div>
              <div className="sg-plot-legend-item"><span>2 pts</span>→ Line</div>
              <div className="sg-plot-legend-item"><span>3 pts</span>→ Triangle</div>
              <div className="sg-plot-legend-item"><span>4-7 pts</span>→ Surface</div>
              <div className="sg-plot-legend-item"><span>8+ pts</span>→ Solid</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROPERTIES PANEL (right, when selecting) ===== */}
      {selectedProps && !plotMode && (
        <div className="sg-properties">
          <div className="sg-panel-header">PROPERTIES</div>
          <div className="sg-props-content">
            <div className="sg-prop-section-title">
              {selectedProps.type.toUpperCase()}
              <span className="sg-prop-id">{selectedProps.id}</span>
            </div>

            <div className="sg-prop-group">
              <div className="sg-prop-label">POSITION</div>
              <div className="sg-prop-row">
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis} className="sg-prop-field">
                    <span className={`sg-axis sg-axis-${axis}`}>{axis.toUpperCase()}</span>
                    <input type="number" step="0.1" value={selectedProps.position[axis]}
                      onChange={e => handleTransformChange('position', axis, e.target.value)} />
                  </div>
                ))}
              </div>
              {/* Plane constraint selector */}
              {transformMode === 'translate' && (
                <div className="sg-plane-selector">
                  <span className="sg-plane-label">PLANE:</span>
                  {['xz', 'xy', 'yz'].map(p => (
                    <button key={p} className={`sg-plane-chip ${movePlane === p ? 'active' : ''}`}
                      onClick={() => setMovePlane(p)}>{p.toUpperCase()}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="sg-prop-group">
              <div className="sg-prop-label">ROTATION (deg)</div>
              <div className="sg-prop-row">
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis} className="sg-prop-field">
                    <span className={`sg-axis sg-axis-${axis}`}>{axis.toUpperCase()}</span>
                    <input type="number" step="5" value={selectedProps.rotation[axis]}
                      onChange={e => handleTransformChange('rotation', axis, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="sg-prop-group">
              <div className="sg-prop-label">SCALE</div>
              <div className="sg-prop-row">
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis} className="sg-prop-field">
                    <span className={`sg-axis sg-axis-${axis}`}>{axis.toUpperCase()}</span>
                    <input type="number" step="0.1" value={selectedProps.scale[axis]}
                      onChange={e => handleTransformChange('scale', axis, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {selectedProps.type !== 'plotted' && (
              <div className="sg-prop-group">
                <div className="sg-prop-label">DIMENSIONS</div>
                {getDimFields(selectedProps.type).map(field => (
                  <div key={field} className="sg-dim-row">
                    <span className="sg-dim-label">{field}</span>
                    <input type="number" step="0.1" min="0.01" value={selectedProps.dims[field]}
                      onChange={e => handleDimChange(field, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            <div className="sg-prop-group">
              <div className="sg-prop-label">COLOR</div>
              <div className="sg-color-row">
                {['#00ccdd', '#ff4466', '#44ff88', '#ffaa00', '#aa44ff', '#ff6600', '#ffffff'].map(c => (
                  <button key={c} className="sg-color-swatch" style={{ background: c }}
                    onClick={() => handleColorChange(c)} />
                ))}
              </div>
            </div>

            {/* Shape Equation */}
            {(() => {
              const eq = getShapeEquation(selectedProps.type, selectedProps.dims);
              return (
                <div className="sg-prop-group sg-equation-group">
                  <div className="sg-prop-label">EQUATION</div>
                  <div className="sg-eq-name">{eq.name}</div>
                  {eq.eqs.map((line, i) => (
                    <div key={i} className="sg-eq-line">{line}</div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== STATUS BAR ===== */}
      <div className="sg-statusbar">
        <span>WASD: Move object/camera | QE: Up/Down | Shift: Fast | Scroll: Zoom</span>
        <span>{plotMode ? 'Click grid to place points • Build when ready' : 'Click to select • Drag gizmo to transform'}</span>
      </div>
    </div>
  );
}

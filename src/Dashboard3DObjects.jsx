import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Dashboard3DObjects.css';

export default function Dashboard3DObjects({ onExplore, onResearch }) {
  const mountRef = useRef(null);
  const quasarHovered = useRef(false);
  const galaxyHovered = useRef(false);
  const galaxySpeed = useRef(0.003);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // === SCENE ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60, mount.clientWidth / mount.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '1';
    mount.appendChild(renderer.domElement);

    // ============================================
    // QUASAR GROUP (position -1.8, -1.2, 0)
    // ============================================
    const quasarGroup = new THREE.Group();
    quasarGroup.position.set(-1.8, -1.2, 0);
    quasarGroup.scale.set(0.6, 0.6, 0.6);
    scene.add(quasarGroup);

    // --- WIREFRAME GRID SPHERE (core) ---
    const coreGeo = new THREE.SphereGeometry(0.22, 16, 12);
    const wireGeo = new THREE.WireframeGeometry(coreGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wireCore = new THREE.LineSegments(wireGeo, wireMat);
    quasarGroup.add(wireCore);

    const innerCoreGeo = new THREE.SphereGeometry(0.11, 10, 8);
    const innerWireGeo = new THREE.WireframeGeometry(innerCoreGeo);
    const innerWireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerWire = new THREE.LineSegments(innerWireGeo, innerWireMat);
    quasarGroup.add(innerWire);

    // --- ACCRETION DISK PARTICLES ---
    const DISK_COUNT = 1200;
    const diskGeo = new THREE.BufferGeometry();
    const diskPos = new Float32Array(DISK_COUNT * 3);
    const diskColors = new Float32Array(DISK_COUNT * 3);
    const diskOriginal = new Float32Array(DISK_COUNT * 3);

    for (let i = 0; i < DISK_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 1.0;
      const thick = (Math.random() - 0.5) * 0.06 *
        (1 - (r - 0.4) / 1.0);
      const x = Math.cos(angle) * r;
      const y = thick;
      const z = Math.sin(angle) * r;
      diskPos[i*3] = x; diskPos[i*3+1] = y; diskPos[i*3+2] = z;
      diskOriginal[i*3] = x;
      diskOriginal[i*3+1] = y;
      diskOriginal[i*3+2] = z;
      const t = (r - 0.4) / 1.0;
      diskColors[i*3]   = 1.0 - t * 0.5;
      diskColors[i*3+1] = 0.4 - t * 0.3;
      diskColors[i*3+2] = 0.1;
    }
    diskGeo.setAttribute('position',
      new THREE.BufferAttribute(diskPos, 3));
    diskGeo.setAttribute('color',
      new THREE.BufferAttribute(diskColors, 3));
    const diskMat = new THREE.PointsMaterial({
      size: 0.014, vertexColors: true,
      transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const diskPts = new THREE.Points(diskGeo, diskMat);
    quasarGroup.add(diskPts);

    // --- POLAR JET PARTICLES (top) ---
    const JET_COUNT = 350;
    const jetTopGeo = new THREE.BufferGeometry();
    const jetTopPos = new Float32Array(JET_COUNT * 3);
    const jetTopOriginal = new Float32Array(JET_COUNT * 3);
    for (let i = 0; i < JET_COUNT; i++) {
      const t = Math.random();
      const r = (1 - t) * 0.1;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r + (Math.random()-0.5)*0.03;
      const y = t * 1.8;
      const z = Math.sin(a) * r + (Math.random()-0.5)*0.03;
      jetTopPos[i*3]=x; jetTopPos[i*3+1]=y; jetTopPos[i*3+2]=z;
      jetTopOriginal[i*3]=x;
      jetTopOriginal[i*3+1]=y;
      jetTopOriginal[i*3+2]=z;
    }
    jetTopGeo.setAttribute('position',
      new THREE.BufferAttribute(jetTopPos, 3));
    const jetMat = new THREE.PointsMaterial({
      size: 0.012, color: 0xaaddff,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const jetTopPts = new THREE.Points(jetTopGeo, jetMat);
    quasarGroup.add(jetTopPts);

    // --- POLAR JET PARTICLES (bottom) ---
    const jetBotGeo = new THREE.BufferGeometry();
    const jetBotPos = new Float32Array(JET_COUNT * 3);
    const jetBotOriginal = new Float32Array(JET_COUNT * 3);
    for (let i = 0; i < JET_COUNT; i++) {
      const t = Math.random();
      const r = (1 - t) * 0.1;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r + (Math.random()-0.5)*0.03;
      const y = -t * 1.8;
      const z = Math.sin(a) * r + (Math.random()-0.5)*0.03;
      jetBotPos[i*3]=x; jetBotPos[i*3+1]=y; jetBotPos[i*3+2]=z;
      jetBotOriginal[i*3]=x;
      jetBotOriginal[i*3+1]=y;
      jetBotOriginal[i*3+2]=z;
    }
    jetBotGeo.setAttribute('position',
      new THREE.BufferAttribute(jetBotPos, 3));
    const jetBotMat = new THREE.PointsMaterial({
      size: 0.012, color: 0xaaddff,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const jetBotPts = new THREE.Points(jetBotGeo, jetBotMat);
    quasarGroup.add(jetBotPts);

    // --- CORONA PARTICLES ---
    const CORONA_COUNT = 600;
    const coronaGeo = new THREE.BufferGeometry();
    const coronaPos = new Float32Array(CORONA_COUNT * 3);
    const coronaOriginal = new Float32Array(CORONA_COUNT * 3);
    for (let i = 0; i < CORONA_COUNT; i++) {
      const r = 0.15 + Math.random() * 0.35;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const x = Math.sin(phi)*Math.cos(theta)*r;
      const y = Math.sin(phi)*Math.sin(theta)*r;
      const z = Math.cos(phi)*r;
      coronaPos[i*3]=x; coronaPos[i*3+1]=y; coronaPos[i*3+2]=z;
      coronaOriginal[i*3]=x;
      coronaOriginal[i*3+1]=y;
      coronaOriginal[i*3+2]=z;
    }
    coronaGeo.setAttribute('position',
      new THREE.BufferAttribute(coronaPos, 3));
    const coronaMat = new THREE.PointsMaterial({
      size: 0.013, color: 0x88ddff,
      transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const coronaPts = new THREE.Points(coronaGeo, coronaMat);
    quasarGroup.add(coronaPts);

    // --- HALO PARTICLES ---
    const HALO_COUNT = 300;
    const haloGeo = new THREE.BufferGeometry();
    const haloPos = new Float32Array(HALO_COUNT * 3);
    const haloOriginal = new Float32Array(HALO_COUNT * 3);
    for (let i = 0; i < HALO_COUNT; i++) {
      const r = 1.0 + Math.random() * 1.0;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const x = Math.sin(phi)*Math.cos(theta)*r;
      const y = Math.sin(phi)*Math.sin(theta)*r;
      const z = Math.cos(phi)*r;
      haloPos[i*3]=x; haloPos[i*3+1]=y; haloPos[i*3+2]=z;
      haloOriginal[i*3]=x;
      haloOriginal[i*3+1]=y;
      haloOriginal[i*3+2]=z;
    }
    haloGeo.setAttribute('position',
      new THREE.BufferAttribute(haloPos, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 0.008, color: 0x004488,
      transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const haloPts = new THREE.Points(haloGeo, haloMat);
    quasarGroup.add(haloPts);

    // INVISIBLE HIT SPHERE for quasar hover detection
    const qHitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 8, 8),
      new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, depthWrite: false
      })
    );
    quasarGroup.add(qHitMesh);

    // ============================================
    // GALAXY GROUP (position 1.8, -1.2, 0)
    // ============================================
    const galaxyGroup = new THREE.Group();
    galaxyGroup.position.set(1.8, -1.2, 0);
    galaxyGroup.scale.set(0.6, 0.6, 0.6);
    scene.add(galaxyGroup);

    // --- GALAXY CORE PARTICLES ---
    const GAL_CORE_COUNT = 400;
    const galCoreGeo = new THREE.BufferGeometry();
    const galCorePos = new Float32Array(GAL_CORE_COUNT * 3);
    const galCoreColors = new Float32Array(GAL_CORE_COUNT * 3);
    for (let i = 0; i < GAL_CORE_COUNT; i++) {
      const r = Math.random() * 0.18;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      galCorePos[i*3]   = Math.sin(phi)*Math.cos(theta)*r;
      galCorePos[i*3+1] = Math.sin(phi)*Math.sin(theta)*r;
      galCorePos[i*3+2] = Math.cos(phi)*r;
      const t = r / 0.18;
      galCoreColors[i*3]   = 1.0;
      galCoreColors[i*3+1] = 1.0 - t * 0.2;
      galCoreColors[i*3+2] = 1.0 - t * 0.6;
    }
    galCoreGeo.setAttribute('position',
      new THREE.BufferAttribute(galCorePos, 3));
    galCoreGeo.setAttribute('color',
      new THREE.BufferAttribute(galCoreColors, 3));
    const galCoreMat = new THREE.PointsMaterial({
      size: 0.02, vertexColors: true,
      transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const galCorePts = new THREE.Points(galCoreGeo, galCoreMat);
    galaxyGroup.add(galCorePts);

    // --- SPIRAL ARM PARTICLES ---
    const SPIRAL_COUNT = 4000;
    const spiralGeo = new THREE.BufferGeometry();
    const spiralPos = new Float32Array(SPIRAL_COUNT * 3);
    const spiralColors = new Float32Array(SPIRAL_COUNT * 3);
    for (let i = 0; i < SPIRAL_COUNT; i++) {
      const arm = i % 2;
      const t = i / SPIRAL_COUNT;
      const angle = t * Math.PI * 5 + arm * Math.PI;
      const radius = 0.25 + t * 2.0;
      const spread = (Math.random()-0.5)*(0.08+t*0.25);
      const height = (Math.random()-0.5)*(0.04+t*0.1);
      spiralPos[i*3]   = Math.cos(angle)*radius + spread;
      spiralPos[i*3+1] = height;
      spiralPos[i*3+2] = Math.sin(angle)*radius + spread;
      if (t < 0.2) {
        spiralColors[i*3]=1; spiralColors[i*3+1]=0.98;
        spiralColors[i*3+2]=0.88;
      } else if (t < 0.5) {
        const tt = (t-0.2)/0.3;
        spiralColors[i*3]   = 1.0 - tt*0.8;
        spiralColors[i*3+1] = 0.8 - tt*0.5;
        spiralColors[i*3+2] = 0.3 + tt*0.7;
      } else {
        const tt = (t-0.5)/0.5;
        spiralColors[i*3]   = 0.2 - tt*0.13;
        spiralColors[i*3+1] = 0.3 - tt*0.2;
        spiralColors[i*3+2] = 1.0 - tt*0.4;
      }
    }
    spiralGeo.setAttribute('position',
      new THREE.BufferAttribute(spiralPos, 3));
    spiralGeo.setAttribute('color',
      new THREE.BufferAttribute(spiralColors, 3));
    const spiralMat = new THREE.PointsMaterial({
      size: 0.011, vertexColors: true,
      transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const spiralPts = new THREE.Points(spiralGeo, spiralMat);
    galaxyGroup.add(spiralPts);

    // --- OUTER HALO ---
    const GAL_HALO_COUNT = 500;
    const galHaloGeo = new THREE.BufferGeometry();
    const galHaloPos = new Float32Array(GAL_HALO_COUNT * 3);
    for (let i = 0; i < GAL_HALO_COUNT; i++) {
      const r = 1.8 + Math.random() * 1.2;
      const phi = Math.acos(1 - 2*Math.random());
      const theta = Math.random() * Math.PI * 2;
      galHaloPos[i*3]   = Math.sin(phi)*Math.cos(theta)*r;
      galHaloPos[i*3+1] = Math.sin(phi)*Math.sin(theta)*r;
      galHaloPos[i*3+2] = Math.cos(phi)*r;
    }
    galHaloGeo.setAttribute('position',
      new THREE.BufferAttribute(galHaloPos, 3));
    const galHaloMat = new THREE.PointsMaterial({
      size: 0.006, color: 0x0a1a33,
      transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    galaxyGroup.add(new THREE.Points(galHaloGeo, galHaloMat));

    // INVISIBLE HIT SPHERE for galaxy hover detection
    const gHitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 8, 8),
      new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, depthWrite: false
      })
    );
    galaxyGroup.add(gHitMesh);

    // ============================================
    // HOLOGRAM PARTICLE TEXT
    // ============================================
    function getTextTargets(word, offsetX, offsetY) {
      const W = 512, H = 128;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px monospace';
      // Center the text on the canvas
      const textWidth = ctx.measureText(word).width;
      const tx = (W - textWidth) / 2;
      const ty = H * 0.7; // baseline at 70% height
      ctx.fillText(word, tx, ty);
      const data = ctx.getImageData(0, 0, W, H).data;
      const allPixels = [];
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const alpha = data[(py * W + px) * 4 + 3];
          if (alpha > 128) {
            allPixels.push({
              x: ((px / W) - 0.5) * 2.5 + offsetX,
              y: -((py / H) - 0.5) * 0.8 + offsetY,
              z: 0.2,
            });
          }
        }
      }
      // Downsample evenly so particles spread across the full text
      if (allPixels.length === 0) return allPixels;
      const step = Math.max(1, Math.floor(allPixels.length / 3500));
      const targets = [];
      for (let i = 0; i < allPixels.length; i += step) {
        targets.push(allPixels[i]);
      }
      return targets;
    }

    const LABEL_COUNT = 3500;

    // EXPLORE label
    const exploreTargets = getTextTargets('EXPLORE', -1.8, -0.35);
    const exploreCurrent = new Float32Array(LABEL_COUNT * 3);
    const exploreScatter = new Float32Array(LABEL_COUNT * 3);
    for (let i = 0; i < LABEL_COUNT; i++) {
      exploreCurrent[i*3]   = -1.8+(Math.random()-0.5)*1.5;
      exploreCurrent[i*3+1] = -0.35+(Math.random()-0.5)*1.5;
      exploreCurrent[i*3+2] = (Math.random()-0.5)*0.8 + 0.5;
      exploreScatter[i*3]   = exploreCurrent[i*3];
      exploreScatter[i*3+1] = exploreCurrent[i*3+1];
      exploreScatter[i*3+2] = exploreCurrent[i*3+2];
    }
    const exploreGeo = new THREE.BufferGeometry();
    exploreGeo.setAttribute('position',
      new THREE.BufferAttribute(exploreCurrent, 3));
    const exploreMat = new THREE.PointsMaterial({
      size: 0.014, color: 0x00ffff,
      transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const explorePts = new THREE.Points(exploreGeo, exploreMat);
    explorePts.position.z = 0.5;
    scene.add(explorePts);

    // RESEARCH label
    const researchTargets = getTextTargets('RESEARCH', 1.8, -0.35);
    const researchCurrent = new Float32Array(LABEL_COUNT * 3);
    const researchScatter = new Float32Array(LABEL_COUNT * 3);
    for (let i = 0; i < LABEL_COUNT; i++) {
      researchCurrent[i*3]   = 1.8+(Math.random()-0.5)*1.5;
      researchCurrent[i*3+1] = -0.35+(Math.random()-0.5)*1.5;
      researchCurrent[i*3+2] = (Math.random()-0.5)*0.8 + 0.5;
      researchScatter[i*3]   = researchCurrent[i*3];
      researchScatter[i*3+1] = researchCurrent[i*3+1];
      researchScatter[i*3+2] = researchCurrent[i*3+2];
    }
    const researchGeo = new THREE.BufferGeometry();
    researchGeo.setAttribute('position',
      new THREE.BufferAttribute(researchCurrent, 3));
    const researchMat = new THREE.PointsMaterial({
      size: 0.014, color: 0xffaa00,
      transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const researchPts = new THREE.Points(researchGeo, researchMat);
    researchPts.position.z = 0.5;
    scene.add(researchPts);

    // ============================================
    // RAYCASTER — MOUSE & CLICK
    // ============================================
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.3 };
    raycaster.params.Line   = { threshold: 0.1 };
    const mouse = new THREE.Vector2();

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const qHit = raycaster.intersectObject(qHitMesh, false);
      const gHit = raycaster.intersectObject(gHitMesh, false);

      if (qHit.length > 0) {
        quasarHovered.current = true;
        galaxyHovered.current = false;
        renderer.domElement.style.cursor = 'pointer';
      } else if (gHit.length > 0) {
        galaxyHovered.current = true;
        quasarHovered.current = false;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        quasarHovered.current = false;
        galaxyHovered.current = false;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.intersectObject(qHitMesh).length > 0) {
        if (onExplore) onExplore();
      }
      if (raycaster.intersectObject(gHitMesh).length > 0) {
        if (onResearch) onResearch();
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // ============================================
    // ANIMATE LOOP
    // ============================================
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = performance.now() / 1000;
      const isQ = quasarHovered.current;
      const isG = galaxyHovered.current;

      // --- QUASAR SCALE ---
      const qTarget = isQ ? 1.0 : 0.6;
      quasarGroup.scale.x += (qTarget - quasarGroup.scale.x) * 0.06;
      quasarGroup.scale.y = quasarGroup.scale.x;
      quasarGroup.scale.z = quasarGroup.scale.x;

      // --- GALAXY SCALE ---
      const gTarget = isG ? 1.0 : 0.6;
      galaxyGroup.scale.x += (gTarget - galaxyGroup.scale.x) * 0.06;
      galaxyGroup.scale.y = galaxyGroup.scale.x;
      galaxyGroup.scale.z = galaxyGroup.scale.x;

      // --- QUASAR WIREFRAME ---
      if (isQ) {
        wireCore.rotation.y  += 0.035;
        wireCore.rotation.x  += 0.018;
        innerWire.rotation.y -= 0.045;
        wireMat.opacity      = 0.95;
        innerWireMat.opacity = 1.0;
      } else {
        wireCore.rotation.y  += 0.01;
        wireCore.rotation.x  += 0.005;
        innerWire.rotation.y -= 0.015;
        wireMat.opacity      = 0.7;
        innerWireMat.opacity = 0.9;
      }

      // --- QUASAR PARTICLES INWARD PULL ---
      const pullSystems = [
        [haloGeo,   haloOriginal,   isQ ? 0.06 : 0.02],
        [jetTopGeo, jetTopOriginal, isQ ? 0.05 : 0.02],
        [jetBotGeo, jetBotOriginal, isQ ? 0.05 : 0.02],
        [diskGeo,   diskOriginal,   isQ ? 0.04 : 0.02],
        [coronaGeo, coronaOriginal, isQ ? 0.03 : 0.02],
      ];
      pullSystems.forEach(([geo, orig, str]) => {
        const pos = geo.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          if (isQ) {
            pos[i]   += (0 - pos[i])   * str;
            pos[i+1] += (0 - pos[i+1]) * str;
            pos[i+2] += (0 - pos[i+2]) * str;
          } else {
            pos[i]   += (orig[i]   - pos[i])   * str;
            pos[i+1] += (orig[i+1] - pos[i+1]) * str;
            pos[i+2] += (orig[i+2] - pos[i+2]) * str;
          }
        }
        geo.attributes.position.needsUpdate = true;
      });

      // Disk rotation
      diskPts.rotation.y += isQ ? 0.04 : 0.015;
      // Jet opacity pulse
      jetMat.opacity    = 0.5 + Math.sin(elapsed*(isQ?8:4))*0.25;
      jetBotMat.opacity = 0.5 + Math.sin(elapsed*(isQ?8:4)+1)*0.25;
      // Quasar group rotation
      quasarGroup.rotation.y += isQ ? 0.02 : 0.008;

      // --- GALAXY SPEED ---
      if (isG) {
        galaxySpeed.current = Math.min(
          galaxySpeed.current + 0.0008, 0.022
        );
      } else {
        galaxySpeed.current = Math.max(
          galaxySpeed.current - 0.0004, 0.003
        );
      }
      galaxyGroup.rotation.y += galaxySpeed.current;
      galaxyGroup.rotation.x = isG
        ? Math.sin(elapsed*1.5)*0.15
        : Math.sin(elapsed*0.4)*0.06;
      galCoreMat.opacity = isG
        ? Math.min(galCoreMat.opacity+0.03, 1.0)
        : 0.85 + Math.sin(elapsed*1.5)*0.1;

      // --- HOLOGRAM TEXT ---
      const updateLabel = (
        current, scatter, targets, mat, hovered, count
      ) => {
        const lerpSpeed = hovered ? 0.07 : 0.025;
        mat.opacity += (hovered ? 1.0 : 0.0 - mat.opacity) * 0.05;
        for (let i = 0; i < count; i++) {
          const target = hovered
            ? targets[i % targets.length]
            : { x: scatter[i*3], y: scatter[i*3+1],
                z: scatter[i*3+2] };
          current[i*3]   += (target.x - current[i*3])   * lerpSpeed;
          current[i*3+1] += (target.y - current[i*3+1]) * lerpSpeed;
          current[i*3+2] += (target.z - current[i*3+2]) * lerpSpeed;
          // Idle drift when not hovered
          if (!hovered) {
            scatter[i*3]   += Math.sin(elapsed+i)*0.0006;
            scatter[i*3+1] += Math.cos(elapsed+i*0.7)*0.0006;
          }
        }
      };

      updateLabel(exploreCurrent, exploreScatter, exploreTargets,
        exploreMat, isQ, LABEL_COUNT);
      exploreGeo.attributes.position.needsUpdate = true;

      updateLabel(researchCurrent, researchScatter, researchTargets,
        researchMat, isG, LABEL_COUNT);
      researchGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // ============================================
    // RESIZE HANDLER
    // ============================================
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener(
        'mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
        overflow: 'visible',
        transformOrigin: 'center',
      }}
    />
  );
}
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './TesseractButton.css';

const TesseractButton = ({ onClick }) => {
  const mountRef = useRef(null);
  const hoverRef = useRef(false);
  const pressRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Sync state to refs for use inside the three.js animation loop
  useEffect(() => {
    hoverRef.current = isHovered;
    pressRef.current = isPressed;
  }, [isHovered, isPressed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(200, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // 2. Object Design (Tesseract)
    const tesseractGroup = new THREE.Group();
    
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });

    const size1 = 1.2; // Outer cube half-size
    const size2 = 0.6; // Inner cube half-size

    // Outer Cube
    const geo1 = new THREE.BoxGeometry(size1 * 2, size1 * 2, size1 * 2);
    const edges1 = new THREE.EdgesGeometry(geo1);
    const cube1 = new THREE.LineSegments(edges1, material);

    // Inner Cube
    const geo2 = new THREE.BoxGeometry(size2 * 2, size2 * 2, size2 * 2);
    const edges2 = new THREE.EdgesGeometry(geo2);
    const cube2 = new THREE.LineSegments(edges2, material);

    // Connecting Diagonal Lines
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    
    const linePoints = [];
    corners.forEach(c => {
      linePoints.push(new THREE.Vector3(c[0] * size1, c[1] * size1, c[2] * size1));
      linePoints.push(new THREE.Vector3(c[0] * size2, c[1] * size2, c[2] * size2));
    });
    
    const linesGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const connectingLines = new THREE.LineSegments(linesGeo, material);

    tesseractGroup.add(cube1);
    tesseractGroup.add(cube2);
    tesseractGroup.add(connectingLines);
    scene.add(tesseractGroup);

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
      depthTest: false
    });
    
    const radius = 2.5;
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(64);
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
    
    const ringX = new THREE.Line(ringGeo, gridMaterial);
    ringX.rotation.y = Math.PI / 2;
    
    const ringY = new THREE.Line(ringGeo, gridMaterial);
    ringY.rotation.x = Math.PI / 2;
    
    const ringZ = new THREE.Line(ringGeo, gridMaterial);
    
    const directionalGrid = new THREE.Group();
    directionalGrid.add(ringX, ringY, ringZ);
    scene.add(directionalGrid);

    camera.position.z = 3.5;

    // 3. Animation Loop
    let animationFrameId;
    let time = 0;
    let currentBaseScale = 1.0;
    const baseColor = new THREE.Color(0x00ffff);
    const hoverColor = new THREE.Color(0xaaffff);

    const animate = () => {
      time += 0.015;

      // Continuous rotation
      tesseractGroup.rotation.x += 0.004;
      tesseractGroup.rotation.y += 0.007;
      tesseractGroup.rotation.z += 0.002;

      directionalGrid.rotation.x += 0.001;
      directionalGrid.rotation.y += 0.002;

      // Interaction Lerping (Smooth transitions)
      const targetOpacity = pressRef.current ? 1.0 : (hoverRef.current ? 0.9 : 0.4);
      material.opacity += (targetOpacity - material.opacity) * 0.1;
      
      material.color.lerp(hoverRef.current ? hoverColor : baseColor, 0.1);

      const targetBaseScale = pressRef.current ? 0.85 : (hoverRef.current ? 1.05 : 1.0);
      currentBaseScale += (targetBaseScale - currentBaseScale) * 0.15;

      // Pulsing effect
      const pulse = 1 + Math.sin(time * 3) * 0.03;
      const finalScale = currentBaseScale * pulse;
      tesseractGroup.scale.set(finalScale, finalScale, finalScale);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 4. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
      geo1.dispose();
      geo2.dispose();
      linesGeo.dispose();
      material.dispose();
      ringGeo.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className="tesseract-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => { setIsPressed(false); if (onClick) onClick(); }}
      role="button"
      tabIndex={0}
    >
      <div className="tesseract-canvas-wrapper" ref={mountRef} />
    </div>
  );
};

export default TesseractButton;

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './SphereField3D.css';

const SphereField3D = ({ state }) => {
  const mountRef = useRef(null);
  
  // Track state transitions natively via ref so the animation loop always operates on the latest prop without tearing down the renderer
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Setup minimal Three.js Scene pipeline
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Bounds perfectly matched with old CSS .spherical-grid margins
    renderer.setSize(220, 220);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // 2. Geometry & Wireframe Generation
    // Keeping width/height segments low (12x12) for a minimalist tech-wireframe appearance
    const geometry = new THREE.SphereGeometry(2.5, 12, 12); 
    const wireframe = new THREE.WireframeGeometry(geometry);
    
    const baseColor = new THREE.Color(0x00ffff);
    const hoverColor = new THREE.Color(0xaaffff);
    
    const material = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.10, // Match Tesseract faint grid visibility
      depthTest: false // Renders uniformly regardless of particle overlap
    });
    
    const sphere = new THREE.LineSegments(wireframe, material);
    scene.add(sphere);

    camera.position.z = 4.5;

    // 3. Render and Automation Loop
    let animationFrameId;
    let currentScale = 1.0;
    
    const animate = () => {
      const currentState = stateRef.current;
      
      // Determine physical targets dynamically based on React state string
      let targetScale = 1.0;
      let targetOpacity = 0.10;
      let rotXSpeed = 0.002;
      let rotYSpeed = 0.003;
      let targetColor = baseColor;

      if (currentState === 'hover') {
        targetScale = 0.6;
        targetOpacity = 0.35; // Kept slightly brighter structurally under hover stress
        // Speeds up dramatically to represent charging energy
        rotXSpeed = 0.006;
        rotYSpeed = 0.008;
        targetColor = hoverColor;
      } else if (currentState === 'collapsing') {
        targetScale = 0.1;
        targetOpacity = 0.8;
        rotXSpeed = 0.015;
        rotYSpeed = 0.015;
      } else if (currentState === 'exploding') {
        targetScale = 0.0;
        targetOpacity = 0;
        rotXSpeed = 0.002;
        rotYSpeed = 0.003;
      }

      // Smooth geometric interpolation (Lerping instead of CSS transitions)
      currentScale += (targetScale - currentScale) * 0.1;
      sphere.scale.set(currentScale, currentScale, currentScale);
      
      material.opacity += (targetOpacity - material.opacity) * 0.1;
      material.color.lerp(targetColor, 0.1);

      // Apply constant continuous rotation
      sphere.rotation.x += rotXSpeed;
      sphere.rotation.y += rotYSpeed;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 4. Memory Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      wireframe.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="sphere-3d-wrapper" ref={mountRef} />;
};

export default SphereField3D;

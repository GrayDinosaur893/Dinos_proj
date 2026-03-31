import React, { useState, useMemo } from 'react';
import SphereField3D from './SphereField3D';
import './ParticleButton.css';

const PARTICLE_COUNT = 90; // Slightly higher for better 3D spherical volume

const ParticleButton = ({ onStart }) => {
  const [state, setState] = useState('idle'); // 'idle', 'hover', 'collapsing', 'exploding'

  // Generate 3D spherical properties for particles
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      // 1. SPHERICAL DISTRIBUTION MATH
      // Center origin (0,0,0). bias random heavily towards center so edges have lower density.
      const maxRadius = 80;
      const r = Math.pow(Math.random(), 1.5) * maxRadius; 
      
      const theta = Math.random() * 2 * Math.PI; // azimuthal angle
      const phi = Math.acos(2 * Math.random() - 1); // polar angle
      
      // Calculate 3D scatter anchors
      const txIdle = r * Math.sin(phi) * Math.cos(theta);
      const tyIdle = r * Math.sin(phi) * Math.sin(theta);
      const tzIdle = r * Math.cos(phi);
      
      // Calculate depth purely for visual scaling (0 back, 1 front)
      // tz ranges from -maxRadius to +maxRadius
      const depth = (tzIdle + maxRadius) / (maxRadius * 2);
      
      // 2. DEPTH ILLUSION & VISUAL STYLE
      // closer = larger
      const scaleIdle = 0.3 + depth * 1.2; 
      
      const isGlow = Math.random() > 0.65;
      const baseOp = 0.15 + depth * 0.35; // Farther particles are more transparent
      const opIdle = isGlow ? baseOp * 1.5 : baseOp;
      
      const color = isGlow ? '#e0ffff' : '#00aaff';
      const shadow = isGlow ? '0 0 10px #ffffff, 0 0 20px #00ffff' : '0 0 5px #00aaff';
      
      // 3. ORBITAL SYSTEM PARAMS
      // Orbit length (time)
      const orbitDuration = 1.5 + Math.random() * 4; 
      // How wide the particle spins around its anchor point
      const orbitRIdle = 6 + Math.random() * 15;
      // Reversing directions to add organic chaos to the orbit plane
      const spinDirection = Math.random() > 0.5 ? 'spinRight' : 'spinLeft';
      
      // 4. REFINE HOVER STATE
      // Sphere collapses tighter, shrinking distances to center
      const txHover = txIdle * 0.45; 
      const tyHover = tyIdle * 0.45;
      const tzHover = tzIdle * 0.45;
      // Shrink scales slightly when condensed to maintain clean shape
      const scaleHover = scaleIdle * 0.7; 
      const opHover = isGlow ? 1.0 : 0.6; // brighter when spinning fast
      const orbitRHover = 2 + Math.random() * 4; // tightly constrained orbits
      
      // 5. EXPLOSION MATH
      const rExplode = 350 + Math.random() * 250;
      const txExplode = rExplode * Math.sin(phi) * Math.cos(theta);
      const tyExplode = rExplode * Math.sin(phi) * Math.sin(theta);
      const tzExplode = rExplode * Math.cos(phi);

      return {
        id: i,
        // Base structure positions
        '--tx-idle': `${txIdle}px`, '--ty-idle': `${tyIdle}px`, '--tz-idle': `${tzIdle}px`,
        '--tx-hover': `${txHover}px`, '--ty-hover': `${tyHover}px`, '--tz-hover': `${tzHover}px`,
        '--tx-explode': `${txExplode}px`, '--ty-explode': `${tyExplode}px`, '--tz-explode': `${tzExplode}px`,
        
        // Appearances mapped locally
        '--scale-idle': scaleIdle, '--op-idle': Math.min(opIdle, 1),
        '--scale-hover': scaleHover, '--op-hover': Math.min(opHover, 1),
        
        // Orbital constraints
        '--orbit-r-idle': `${orbitRIdle}px`,
        '--orbit-r-hover': `${orbitRHover}px`,
        '--orbit-duration': `${orbitDuration}s`,
        '--spin-anim': spinDirection,
        
        '--p-color': color,
        '--p-shadow': shadow
      };
    });
  }, []);

  const handleMouseEnter = () => { if (state === 'idle') setState('hover'); };
  const handleMouseLeave = () => { if (state === 'hover') setState('idle'); };

  const handleClick = () => {
    if (state === 'collapsing' || state === 'exploding') return;
    
    // Step 1: Rapid Collapse to center
    setState('collapsing');
    
    // Step 2: Core Hold
    setTimeout(() => {
      // Step 3: Explosion
      setState('exploding');
      
      setTimeout(() => {
        if (onStart) onStart();
        setState('idle'); 
      }, 1200); // Wait for the slow explosion fadeout
    }, 100);
  };

  return (
    <div 
      className={`particle-button-container ${state}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <SphereField3D state={state} />
      <div className="particles-wrapper">
        {particles.map(p => (
          // Orbit System: Tiered DIVs
          // Base handles coordinates. Spin handles 360 degree rotation. Visual handles the offset.
          <div key={p.id} className="particle-base" style={p}>
            <div className="particle-spin">
              <div className="particle-visual" />
            </div>
          </div>
        ))}
      </div>
      <div className="particle-text">START</div>
    </div>
  );
};

export default ParticleButton;

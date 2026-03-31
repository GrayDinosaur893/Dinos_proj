import React, { useState, useEffect } from 'react';
import TesseractButton from './TesseractButton';
import ParticleButton from './ParticleButton';
import Login3D from './Login3D';
import PhasesPage from './PhasesPage';
import Dashboard3DObjects from './Dashboard3DObjects';
import ShapesGallery from './ShapesGallery';
import './App.css';

// Dashboard Component
function Dashboard({ setCurrentPage }) {
  return (
    <div className="dashboard">
      <button className="back-btn" onClick={() => setCurrentPage("home")}>
        ← Back
      </button>
      <h2>Welcome, Admin</h2>
      <Dashboard3DObjects 
        onExplore={() => setCurrentPage("explore")}
        onResearch={() => setCurrentPage("research")}
      />
    </div>
  );
}

// 3D Rotating Cube Button Component (for Explore page)
function CubeButton({ label }) {
  return (
    <div className="cube-button">
      <div className="cube">
        <div className="face front">{label}</div>
        <div className="face back">{label}</div>
        <div className="face right">{label}</div>
        <div className="face left">{label}</div>
        <div className="face top">{label}</div>
        <div className="face bottom">{label}</div>
      </div>
    </div>
  );
}

// Explore Page Component
function ExplorePage({ setCurrentPage }) {
  return (
    <div className="explore-page">
      <button className="back-btn" onClick={() => setCurrentPage("dashboard")}>
        ← Back
      </button>
      <h2>Explore</h2>
      <div className="explore-grid">
        <CubeButton label="3D Models" />
        <CubeButton label="Simulations" />
        <CubeButton label="Visual Tools" />
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // 3D Transition state - controls the collapse/emerge animation
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Post-login transition state
  const [showLoginTransition, setShowLoginTransition] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = () => {
      const authToken = localStorage.getItem('auth_token');
      if (authToken === 'user_authenticated' && isMounted) {
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      }
      if (isMounted) {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
    
    return () => { isMounted = false; };
  }, []);

  const handleStart = () => {
    setCurrentPage('login');
    console.log("System Initialized...");
  };

  // Triggered when login is successful
  // Starts the post-login transition effect
  const handleLogin = () => {
    // Start collapse transition
    setShowLoginTransition(true);
    
    // After collapse animation completes (~600ms):
    // Show the video orb for ~4 seconds, then switch to Dashboard
    setTimeout(() => {
      // After orb displays for 4 seconds, switch to Dashboard
      setTimeout(() => {
        setShowLoginTransition(false);
        setIsLoggedIn(true);
        setIsTransitioning(false);
        setCurrentPage("dashboard");
        // Store auth token
        localStorage.setItem('auth_token', 'user_authenticated');
        console.log("Access Granted - User authenticated");
      }, 4000);
    }, 600);
  };

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setCurrentPage('login');
    console.log("Session Terminated - User logged out");
  };

  // Show nothing until auth check is complete
  if (!authChecked) {
    return null;
  }

  return (
    <>
      {/* Main UI Layer */}
      <div className={`app-container ${showLoginTransition ? 'collapse' : ''}`}>
        {currentPage === 'dashboard' ? (
          <Dashboard setCurrentPage={setCurrentPage} />
        ) : currentPage === 'explore' ? (
          <ShapesGallery onBack={() => setCurrentPage('dashboard')} />
        ) : currentPage === 'research' ? (
          <PhasesPage onLogout={handleLogout} />
        ) : currentPage === 'home' ? (
          <>
            <div className="left-section">
              <TesseractButton />
            </div>
            
            <div className="right-section">
              <div className="system-label">// SYSTEM INITIALIZED</div>
              <h1 className="main-heading">Enter the Grid</h1>
              <p className="description-paragraph">
                This platform guides you through building a system that converts mathematical equations into visual models. Progress step by step, learn required concepts, and implement each phase—from basic 2D rendering to advanced 3D model generation and real-world output.
              </p>
              <ParticleButton onStart={handleStart} />
            </div>
          </>
        ) : (
          <div className="transition-wrapper">
            {/* 
              TRANSITION LOGIC:
              - When NOT transitioning: show the appropriate page normally
              - When transitioning: 
                * Login page gets 'page-collapse' class (shrinks into center)
                * PhasesPage gets 'page-emerge' class (emerges from center)
            */}
            
            {/* Login Page - shown when not logged in */}
            {(!isLoggedIn) && (
              <div 
                className={`page-container ${isTransitioning ? 'page-collapse' : ''}`}
              >
                <Login3D onLogin={handleLogin} />
              </div>
            )}
            
            {/* Phases Page - shown when logged in */}
            {isLoggedIn && (
              <div 
                className={`page-container ${!isTransitioning ? 'page-emerge' : ''}`}
              >
                <PhasesPage onLogout={handleLogout} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post-login transition orb */}
      {showLoginTransition && (
        <div className="transition-orb">
          <video autoPlay loop muted playsInline>
            <source src="./login/From Main Klickpin CF- Video Pinterest - 2WmVMJRF1.mp4" type="video/mp4" />
          </video>
        </div>
      )}
    </>
  );
}

export default App;
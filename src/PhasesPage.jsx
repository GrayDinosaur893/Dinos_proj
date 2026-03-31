import React, { useState, useEffect, useRef } from 'react';
import ProgressBar from './ProgressBar';
import './PhasesPage.css';

const PhasesPage = ({ onLogout }) => {
  const [phases, setPhases] = useState([]);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Get user ID from localStorage (or generate one if not exists)
  const getUserId = () => {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = `user_${Date.now()}`;
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  };

  const userId = getUserId();

  // Load phase data from JSON file and localStorage on mount
  useEffect(() => {
    const loadPhases = async () => {
      try {
        // Load base phase data from JSON
        const response = await fetch('/phases.json');
        const basePhases = await response.json();

        // Load user progress from localStorage
        const savedProgress = localStorage.getItem('phase_progress');
        if (savedProgress) {
          const savedPhases = JSON.parse(savedProgress);
          const mergedPhases = basePhases.map((phase) => {
            const saved = savedPhases.find((p) => p.id === phase.id);
            return saved ? { ...phase, ...saved } : phase;
          });
          setPhases(mergedPhases);
        } else {
          setPhases(basePhases);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading phases:', error);
        setLoading(false);
      }
    };

    loadPhases();
  }, [userId]);

  // Save progress to localStorage whenever phases change
  useEffect(() => {
    if (phases.length > 0) {
      // Save to localStorage (always)
      localStorage.setItem('phase_progress', JSON.stringify(phases));
    }
  }, [phases]);

  // Calculate completed phases (phases with at least one image)
  const completedCount = phases.filter((p) => p.imageUrl).length;
  const totalCount = phases.length;

  // Get current phase
  const currentPhase = phases[currentPhaseIndex] || phases[phases.length - 1];

  // Check if all phases are completed
  const allCompleted = completedCount === totalCount;

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && currentPhase) {
      handleUpload(file, currentPhase.id);
    }
  };

  // Handle image upload to Cloudinary
  const handleUpload = async (file, phaseId) => {
    if (!file || !phaseId) return;

    setUploading(true);
    setUploadMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload'); // 🔥 required

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnrrgj1hs/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      console.log('Uploaded:', data.secure_url);

      if (data.secure_url) {
        // Append to uploaded images array
        setUploadedImages(prev => [...prev, data.secure_url]);
        
        // Update phase with Cloudinary URL
        setPhases(prev => 
          prev.map(p => 
            p.id === phaseId 
              ? { ...p, imageUrl: data.secure_url, completed: true }
              : p
          )
        );
        setUploadMessage({ type: 'success', text: 'Proof uploaded successfully!' });
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Handle image removal
  const handleRemove = (phaseId) => {
    setPhases(prev => 
      prev.map(p => 
        p.id === phaseId 
          ? { ...p, imageUrl: null, completed: false }
          : p
      )
    );
    setUploadMessage({ type: 'success', text: 'Image removed successfully!' });
  };

  // Handle individual image removal from array
  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear upload message after delay
  useEffect(() => {
    if (uploadMessage.text) {
      const timer = setTimeout(() => {
        setUploadMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  if (loading) {
    return (
      <div className="phases-page">
        <div className="loading-message">LOADING PHASES...</div>
      </div>
    );
  }

  return (
    <div className="phases-page">
      <div className="phases-header">
        <h1>Project Phases</h1>
        <div className="header-line"></div>
      </div>

      {/* Progress Bar */}
      <ProgressBar completed={completedCount} total={totalCount} />

      {/* All phases completed */}
      {allCompleted ? (
        <div className="completion-screen">
          <div className="completion-icon">✓</div>
          <h2 className="completion-title">ALL PHASES COMPLETE</h2>
          <p className="completion-message">
            You have successfully completed all phases of the system.
          </p>
          <button className="restart-btn" onClick={() => window.location.reload()}>
            RESTART SYSTEM
          </button>
        </div>
      ) : (
        /* Current Phase Content */
        <div className="current-phase-container">
          <div className="phase-indicator">
            PHASE {currentPhase.id} OF {totalCount}
          </div>

          <div className="phase-content-card">
            <h2 className="phase-title">{currentPhase.title}</h2>
            <p className="phase-description">{currentPhase.description}</p>

            <div className="tasks-section">
              <h3 className="tasks-header">TASKS:</h3>
              <ul className="tasks-list">
                {currentPhase.tasks.map((task, index) => (
                  <li key={index} className="task-item">
                    <span className="task-marker">▸</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
              <h3 className="tasks-header">UPLOAD PROOF:</h3>
              
              {currentPhase.imageUrl ? (
                <div className="upload-completed">
                  <div className="upload-success-icon">✓</div>
                  <span className="upload-success-text">
                    PROOF ADDED
                  </span>
                  
                  {/* Display uploaded image */}
                  <div className="image-preview" style={{ marginTop: '20px', marginBottom: '15px' }}>
                    <img src={currentPhase.imageUrl} alt={`Phase ${currentPhase.id} proof`} />
                  </div>
                  
                  {/* Remove button */}
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(currentPhase.id)}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="upload-container">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={uploading}
                  />
                  <button 
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'UPLOADING...' : 'UPLOAD PROOF'}
                  </button>
                  <span className="upload-hint">Upload an image as proof of completion</span>
                </div>
              )}

              {uploadMessage.text && (
                <div className={`upload-message ${uploadMessage.type}`}>
                  {uploadMessage.text}
                </div>
              )}
            </div>

            {/* Uploaded Images Section */}
            {uploadedImages.length > 0 && (
              <div className="uploaded-images-section">
                <h3 className="tasks-header">UPLOADED IMAGES:</h3>
                <div className="uploaded-images-grid">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="uploaded-image-item">
                      <button 
                        className="image-remove-btn"
                        onClick={() => handleRemoveImage(index)}
                        title="Remove image"
                      >
                        ❌
                      </button>
                      <img src={imageUrl} alt={`Uploaded ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase navigation dots */}
          <div className="phase-nav-dots">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`nav-dot ${phase.imageUrl ? 'completed' : ''} ${index === currentPhaseIndex ? 'active' : ''}`}
                onClick={() => setCurrentPhaseIndex(index)}
                title={phase.imageUrl ? 'Proof added' : 'No proof'}
              />
            ))}
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={onLogout}>
        TERMINATE SESSION
      </button>
    </div>
  );
};

export default PhasesPage;
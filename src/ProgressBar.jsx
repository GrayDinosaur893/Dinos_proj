import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-label">SYSTEM PROGRESS</span>
        <span className="progress-percentage">{Math.round(percentage)}%</span>
      </div>
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-bar-glow"></div>
        </div>
      </div>
      <div className="progress-status">
        {completed} of {total} phases completed
      </div>
    </div>
  );
};

export default ProgressBar;
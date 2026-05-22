'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  label: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-label">{label}</span>
        <span className="progress-percentage">{progress}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

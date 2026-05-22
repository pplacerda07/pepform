'use client';

import React from 'react';

interface RejectionScreenProps {
  onRestart: () => void;
}

export default function RejectionScreen({ onRestart }: RejectionScreenProps) {
  return (
    <div className="question-card animate-in">
      <div className="rejection-screen">
        <div className="rejection-icon">🔒</div>

        <h2 className="rejection-title">Tudo bem.</h2>

        <p className="rejection-message">
          Quando estiver pronto de verdade, volte aqui.
          <br />
          A lista continua privada.
        </p>

        <button
          className="btn-restart"
          onClick={onRestart}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Mudei de ideia
        </button>
      </div>
    </div>
  );
}

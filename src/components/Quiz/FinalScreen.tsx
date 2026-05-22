'use client';

import React from 'react';

export default function FinalScreen() {
  return (
    <div className="question-card animate-in">
      <div className="final-screen">
        <div className="final-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="final-title">Formulário recebido ✅</h2>

        <p className="final-message">
          Em breve um dos nossos atendentes vai entrar em contato pelo WhatsApp com a lista completa.
        </p>

        <p className="final-message">
          Aguarde nossa mensagem. Atendemos em horário comercial.
        </p>

        <div className="final-note">
          🔒 Lembrando: a lista é privada. Pedimos discrição.
        </div>
      </div>
    </div>
  );
}

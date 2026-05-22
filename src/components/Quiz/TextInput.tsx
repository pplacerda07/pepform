'use client';

import React, { useRef, useEffect } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function TextInput({ value, onChange, placeholder = 'Seu nome', error }: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus with slight delay for animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        id="input-nome"
        type="text"
        className={`input-field${error ? ' input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="given-name"
        autoCapitalize="words"
      />
      {error && (
        <div className="error-message">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

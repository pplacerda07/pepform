'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function formatPhone(digits: string): string {
  const cleaned = digits.replace(/\D/g, '').slice(0, 11);

  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

export default function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      onChange(formatPhone(raw));
    },
    [onChange]
  );

  return (
    <div>
      <input
        ref={inputRef}
        id="input-whatsapp"
        type="tel"
        inputMode="numeric"
        className={`input-field${error ? ' input-error' : ''}`}
        value={value}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        autoComplete="tel"
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

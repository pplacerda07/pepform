'use client';

import React from 'react';
import { QuizOption } from '@/types/quiz';

interface MultiSelectProps {
  options: QuizOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function MultiSelect({ options, selected, onToggle }: MultiSelectProps) {
  return (
    <div className="options-list stagger">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.id}
            id={option.id}
            className={`option-button${isSelected ? ' selected' : ''}`}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            <span className="option-emoji">{option.emoji}</span>
            <span className="option-label">{option.label}</span>
            <span className="option-checkbox">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6L5 9L10 3"
                  stroke="#07070f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import React from 'react';
import { QuizOption } from '@/types/quiz';

interface SingleChoiceProps {
  options: QuizOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function SingleChoice({ options, selected, onSelect }: SingleChoiceProps) {
  return (
    <div className="options-list stagger">
      {options.map((option) => (
        <button
          key={option.id}
          id={option.id}
          className={`option-button${selected === option.value ? ' selected' : ''}`}
          onClick={() => onSelect(option.value)}
          type="button"
        >
          <span className="option-emoji">{option.emoji}</span>
          <span className="option-label">{option.label}</span>
          <span className="option-check">
            <span className="option-check-inner" />
          </span>
        </button>
      ))}
    </div>
  );
}

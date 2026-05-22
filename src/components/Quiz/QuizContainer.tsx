'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { QuizStep, QuizAnswers, ObjectiveType, ExperienceType } from '@/types/quiz';
import { questions } from '@/lib/questions';
import {
  getNextStep,
  getPreviousStep,
  getProgress,
  validateStep,
  getStepLabel,
  getInitialAnswers,
} from '@/lib/quiz-logic';

import ProgressBar from './ProgressBar';
import SingleChoice from './SingleChoice';
import MultiSelect from './MultiSelect';
import TextInput from './TextInput';
import PhoneInput from './PhoneInput';
import FinalScreen from './FinalScreen';
import RejectionScreen from './RejectionScreen';

// ── Molecule background ────────────────────────────────────
function MoleculeBackground() {
  return (
    <div className="molecule-bg" aria-hidden="true">
      {/* Hexagons */}
      <svg className="mol mol-1" viewBox="0 0 100 100">
        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
      </svg>
      <svg className="mol mol-3" viewBox="0 0 100 100">
        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
      </svg>
      <svg className="mol mol-5" viewBox="0 0 100 100">
        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
      </svg>
      <svg className="mol mol-7" viewBox="0 0 100 100">
        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
      </svg>
      <svg className="mol mol-9" viewBox="0 0 100 100">
        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
      </svg>
      {/* Peptide chains */}
      <svg className="mol mol-2" viewBox="0 0 120 60">
        <circle cx="15" cy="30" r="10" />
        <line x1="25" y1="30" x2="45" y2="30" />
        <circle cx="55" cy="30" r="10" />
        <line x1="65" y1="30" x2="85" y2="30" />
        <circle cx="95" cy="30" r="10" />
      </svg>
      <svg className="mol mol-4" viewBox="0 0 120 60">
        <circle cx="15" cy="30" r="10" />
        <line x1="25" y1="30" x2="45" y2="30" />
        <circle cx="55" cy="30" r="10" />
        <line x1="65" y1="30" x2="85" y2="30" />
        <circle cx="95" cy="30" r="10" />
      </svg>
      <svg className="mol mol-6" viewBox="0 0 120 60">
        <circle cx="15" cy="30" r="10" />
        <line x1="25" y1="30" x2="45" y2="30" />
        <circle cx="55" cy="30" r="10" />
        <line x1="65" y1="30" x2="85" y2="30" />
        <circle cx="95" cy="30" r="10" />
      </svg>
      <svg className="mol mol-8" viewBox="0 0 120 60">
        <circle cx="15" cy="30" r="10" />
        <line x1="25" y1="30" x2="45" y2="30" />
        <circle cx="55" cy="30" r="10" />
        <line x1="65" y1="30" x2="85" y2="30" />
        <circle cx="95" cy="30" r="10" />
      </svg>
      <svg className="mol mol-10" viewBox="0 0 120 60">
        <circle cx="15" cy="30" r="10" />
        <line x1="25" y1="30" x2="45" y2="30" />
        <circle cx="55" cy="30" r="10" />
        <line x1="65" y1="30" x2="85" y2="30" />
        <circle cx="95" cy="30" r="10" />
      </svg>
    </div>
  );
}

// ── Intro Screen ──────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro-screen animate-in">
      <Image
        src="/logo.png"
        alt="Frost Peptídeos"
        width={100}
        height={100}
        className="intro-logo"
        priority
      />

      <div className="intro-badge">DIRETO DE FÁBRICA &bull; HONG KONG</div>

      <h1 className="intro-headline">
        Os peptídeos que profissionais usam.{' '}
        <span>Preço de fábrica.</span>
      </h1>

      <p className="intro-body">
        Parceria direta com laboratório em Hong Kong, o mesmo que abastece
        distribuidores nos EUA e na Europa. Sem intermediários. Sem markup de
        loja. Lista privada com vagas limitadas todo mês.
      </p>

      <div className="intro-pills">
        <span className="intro-pill">Laudos de qualidade</span>
        <span className="intro-pill">Rastreamento de lote</span>
        <span className="intro-pill">40-70% abaixo do mercado</span>
      </div>

      <button className="intro-cta" onClick={onStart} type="button">
        Verificar Disponibilidade
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      <p className="intro-note">Formulário de qualificação. 2 minutos.</p>
    </div>
  );
}

// ── Back arrow SVG ─────────────────────────────────────────
function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function NextArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────
export default function QuizContainer() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState<QuizStep>('gate');
  const [answers, setAnswers] = useState<QuizAnswers>(getInitialAnswers());
  const [stepHistory, setStepHistory] = useState<QuizStep[]>(['gate']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = useMemo(() => getProgress(currentStep, answers), [currentStep, answers]);
  const stepLabel = useMemo(() => getStepLabel(currentStep), [currentStep]);
  const isValid = useMemo(() => validateStep(currentStep, answers), [currentStep, answers]);

  const transitionTo = useCallback((nextStep: QuizStep) => {
    setIsAnimating(true);
    setAnimationClass('animate-out');
    setTimeout(() => {
      setCurrentStep(nextStep);
      setStepHistory((prev) => [...prev, nextStep]);
      setAnimationClass('animate-in');
      setErrors({});
      setTimeout(() => setIsAnimating(false), 400);
    }, 250);
  }, []);

  const handleNext = useCallback(async () => {
    if (isAnimating || !isValid) return;
    const nextStep = getNextStep(currentStep, answers);

    if (nextStep === 'final') {
      setIsSubmitting(true);
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...answers, data_envio: new Date().toISOString() }),
        });
      } catch (err) {
        console.error('Submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    transitionTo(nextStep);
  }, [isAnimating, isValid, currentStep, answers, transitionTo]);

  const handleBack = useCallback(() => {
    if (isAnimating) return;
    const prevStep = getPreviousStep(currentStep, answers);
    if (!prevStep) return;
    setIsAnimating(true);
    setAnimationClass('animate-out');
    setTimeout(() => {
      setCurrentStep(prevStep);
      setStepHistory((prev) => prev.slice(0, -1));
      setAnimationClass('animate-in');
      setErrors({});
      setTimeout(() => setIsAnimating(false), 400);
    }, 250);
  }, [isAnimating, currentStep, answers]);

  const handleRestart = useCallback(() => {
    setIsAnimating(true);
    setAnimationClass('animate-out');
    setTimeout(() => {
      setCurrentStep('gate');
      setAnswers(getInitialAnswers());
      setStepHistory(['gate']);
      setAnimationClass('animate-in');
      setErrors({});
      setShowIntro(true);
      setTimeout(() => setIsAnimating(false), 400);
    }, 250);
  }, []);

  const handleSingleSelect = useCallback(
    (field: keyof QuizAnswers, value: string) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
      setTimeout(() => {
        const updated = { ...answers, [field]: value };
        const nextStep = getNextStep(currentStep, updated);
        setIsAnimating(true);
        setAnimationClass('animate-out');
        setTimeout(() => {
          setCurrentStep(nextStep);
          setStepHistory((prev) => [...prev, nextStep]);
          setAnimationClass('animate-in');
          setErrors({});
          setAnswers(updated);
          setTimeout(() => setIsAnimating(false), 400);
        }, 250);
      }, 300);
    },
    [answers, currentStep]
  );

  const handleMultiToggle = useCallback((value: string) => {
    setAnswers((prev) => {
      const current = prev.objetivos;
      const updated = current.includes(value as ObjectiveType)
        ? current.filter((v) => v !== value)
        : [...current, value as ObjectiveType];
      return { ...prev, objetivos: updated };
    });
  }, []);

  const canGoBack = useMemo(
    () => getPreviousStep(currentStep, answers) !== null,
    [currentStep, answers]
  );

  const showProgress = !['final', 'rejected'].includes(currentStep);

  const renderStep = () => {
    const question = questions[currentStep];

    switch (currentStep) {
      case 'gate':
        return (
          <div className={`question-card ${animationClass}`} key="gate">
            {question.introText && (
              <div className="question-intro">{question.introText}</div>
            )}
            <h2 className="question-title">{question.title}</h2>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <SingleChoice
                options={question.options!}
                selected={answers.intencao}
                onSelect={(value) => handleSingleSelect('intencao', value)}
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className={`question-card ${animationClass}`} key="profile">
            <h2 className="question-title">{question.title}</h2>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <SingleChoice
                options={question.options!}
                selected={answers.perfil}
                onSelect={(value) => handleSingleSelect('perfil', value)}
              />
            </div>
            <div className="nav-buttons" style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                <BackArrow />
              </button>
            </div>
          </div>
        );

      case 'objectives':
        return (
          <div className={`question-card ${animationClass}`} key="objectives">
            <h2 className="question-title">{question.title}</h2>
            {question.subtitle && (
              <p className="question-subtitle">{question.subtitle}</p>
            )}
            <MultiSelect
              options={question.options!}
              selected={answers.objetivos}
              onToggle={handleMultiToggle}
            />
            <div className="nav-buttons">
              <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                <BackArrow />
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isValid || isAnimating}
                type="button"
              >
                Continuar
                <NextArrow />
              </button>
            </div>
          </div>
        );

      case 'reseller':
        return (
          <div className={`question-card ${animationClass}`} key="reseller">
            <h2 className="question-title">{question.title}</h2>
            {question.subtitle && (
              <p className="question-subtitle">{question.subtitle}</p>
            )}
            <SingleChoice
              options={question.options!}
              selected={answers.operacao_revenda}
              onSelect={(value) => handleSingleSelect('operacao_revenda', value)}
            />
            <div className="nav-buttons" style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                <BackArrow />
              </button>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className={`question-card ${animationClass}`} key="experience">
            <h2 className="question-title">{question.title}</h2>
            {question.subtitle && (
              <p className="question-subtitle">{question.subtitle}</p>
            )}
            <SingleChoice
              options={question.options!}
              selected={answers.experiencia}
              onSelect={(value) => handleSingleSelect('experiencia', value as ExperienceType)}
            />
            <div className="nav-buttons" style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                <BackArrow />
              </button>
            </div>
          </div>
        );

      case 'name':
        return (
          <div className={`question-card ${animationClass}`} key="name">
            <div className="contact-step-note">
              Quase lá. Para personalizar sua lista e enviar os preços certos, preciso de um contato.
            </div>
            <h2 className="question-title">{question.title}</h2>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <TextInput
                value={answers.nome}
                onChange={(value) => setAnswers((prev) => ({ ...prev, nome: value }))}
                placeholder="Seu nome"
                error={errors.nome}
              />
            </div>
            <div className="nav-buttons">
              {canGoBack && (
                <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                  <BackArrow />
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isValid || isAnimating}
                type="button"
              >
                Continuar
                <NextArrow />
              </button>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className={`question-card ${animationClass}`} key="whatsapp">
            <h2 className="question-title">{question.title}</h2>
            {question.subtitle && (
              <p className="question-subtitle">{question.subtitle}</p>
            )}
            <PhoneInput
              value={answers.whatsapp}
              onChange={(value) => setAnswers((prev) => ({ ...prev, whatsapp: value }))}
              error={errors.whatsapp}
            />
            <div className="nav-buttons">
              <button className="btn btn-back" onClick={handleBack} type="button" aria-label="Voltar">
                <BackArrow />
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isValid || isAnimating || isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Quero acesso
                    <NextArrow />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'final':
        return <FinalScreen key="final" />;

      case 'rejected':
        return <RejectionScreen key="rejected" onRestart={handleRestart} />;

      default:
        return null;
    }
  };

  return (
    <>
      <MoleculeBackground />

      <div className="quiz-wrapper">
        {showIntro ? (
          <IntroScreen onStart={() => setShowIntro(false)} />
        ) : (
          <>
            <div className="brand-header">
              <Image
                src="/logo.png"
                alt="Frost Peptídeos"
                width={44}
                height={44}
                className="brand-logo-img"
              />
              <div className="brand-name">FROST PEPTÍDEOS</div>
              <div className="brand-tag">Lista Privada &bull; Direto de Fábrica</div>
            </div>

            {showProgress && (
              <ProgressBar progress={progress} label={stepLabel} />
            )}

            {renderStep()}
          </>
        )}
      </div>
    </>
  );
}

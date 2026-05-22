// ============================================================
// FrostForm — Lógica de Roteamento do Funil
// Novo fluxo: contato (nome + zap) vai para o FINAL
// gate → profile → objectives/reseller → experience → name → whatsapp → final
// ============================================================

import { QuizStep, ProfileType, QuizAnswers } from '@/types/quiz';

export function getNextStep(currentStep: QuizStep, answers: QuizAnswers): QuizStep {
  switch (currentStep) {
    case 'gate':
      return answers.intencao === 'sim' ? 'profile' : 'rejected';

    case 'profile':
      return answers.perfil === 'revendedor' ? 'reseller' : 'objectives';

    case 'objectives':
      return 'experience';

    case 'reseller':
      return 'experience';

    case 'experience':
      return 'name';

    case 'name':
      return 'whatsapp';

    case 'whatsapp':
      return 'final';

    default:
      return 'final';
  }
}

export function getPreviousStep(currentStep: QuizStep, answers: QuizAnswers): QuizStep | null {
  switch (currentStep) {
    case 'gate':      return null;
    case 'profile':   return 'gate';
    case 'objectives':return 'profile';
    case 'reseller':  return 'profile';
    case 'experience':
      return answers.perfil === 'revendedor' ? 'reseller' : 'objectives';
    case 'name':      return 'experience';
    case 'whatsapp':  return 'name';
    default:          return null;
  }
}

export function getProgress(currentStep: QuizStep, answers: QuizAnswers): number {
  const stepOrder: Record<string, number> = {
    gate:        1,
    profile:     2,
    objectives:  3,
    reseller:    3,
    experience:  4,
    name:        5,
    whatsapp:    6,
    final:       7,
    rejected:    1,
  };
  const total = 6;
  const current = stepOrder[currentStep] || 1;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function validateStep(step: QuizStep, answers: QuizAnswers): boolean {
  switch (step) {
    case 'gate':       return answers.intencao !== '';
    case 'profile':    return answers.perfil !== '';
    case 'objectives': return answers.objetivos.length > 0;
    case 'experience': return answers.experiencia !== '';
    case 'reseller':   return answers.operacao_revenda !== '';
    case 'name':       return answers.nome.trim().length >= 2;
    case 'whatsapp': {
      const digits = answers.whatsapp.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 11;
    }
    default: return true;
  }
}

export function getStepLabel(step: QuizStep): string {
  const labels: Record<QuizStep, string> = {
    gate:        'Verificação',
    profile:     'Seu perfil',
    objectives:  'Objetivos',
    experience:  'Experiência',
    reseller:    'Sua operação',
    name:        'Quase lá',
    whatsapp:    'Contato',
    final:       'Confirmação',
    rejected:    '',
  };
  return labels[step] || '';
}

export function getInitialAnswers(): QuizAnswers {
  return {
    intencao: '',
    nome: '',
    whatsapp: '',
    perfil: '',
    objetivos: [],
    experiencia: '',
    operacao_revenda: '',
    data_envio: '',
  };
}

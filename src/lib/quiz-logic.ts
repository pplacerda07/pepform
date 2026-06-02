// ============================================================
// FrostForm — Lógica de Roteamento do Funil
// Novo fluxo com educação pós-nome:
// gate → profile → objectives|reseller → experience → name →
// info-origem → info-frete → info-prazo → info-alfandega → final
// ============================================================

import { QuizStep, QuizAnswers } from '@/types/quiz';

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
      return 'info-origem';

    case 'info-origem':
      return 'info-frete';

    case 'info-frete':
      return 'info-prazo';

    case 'info-prazo':
      return 'info-alfandega';

    case 'info-alfandega':
      return 'final';

    default:
      return 'final';
  }
}

export function getPreviousStep(currentStep: QuizStep, answers: QuizAnswers): QuizStep | null {
  switch (currentStep) {
    case 'gate':           return null;
    case 'profile':        return 'gate';
    case 'objectives':     return 'profile';
    case 'reseller':       return 'profile';
    case 'experience':
      return answers.perfil === 'revendedor' ? 'reseller' : 'objectives';
    case 'name':           return 'experience';
    case 'info-origem':    return 'name';
    case 'info-frete':     return 'info-origem';
    case 'info-prazo':     return 'info-frete';
    case 'info-alfandega': return 'info-prazo';
    default:               return null;
  }
}

export function getProgress(currentStep: QuizStep, _answers: QuizAnswers): number {
  const stepOrder: Record<string, number> = {
    gate:             1,
    profile:          2,
    objectives:       3,
    reseller:         3,
    experience:       4,
    name:             5,
    'info-origem':    6,
    'info-frete':     7,
    'info-prazo':     8,
    'info-alfandega': 9,
    final:            10,
    rejected:         1,
  };
  const total = 9;
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
    case 'info-origem':
    case 'info-frete':
    case 'info-prazo':
    case 'info-alfandega':
      return true;
    default: return true;
  }
}

export function getStepLabel(step: QuizStep): string {
  const labels: Record<QuizStep, string> = {
    gate:             'Verificação',
    profile:          'Seu perfil',
    objectives:       'Objetivos',
    experience:       'Experiência',
    reseller:         'Sua operação',
    name:             'Quase lá',
    'info-origem':    'Como funciona',
    'info-frete':     'Frete',
    'info-prazo':     'Prazo',
    'info-alfandega': 'Alfândega',
    final:            'Confirmação',
    rejected:         '',
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

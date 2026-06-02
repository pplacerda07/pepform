// ============================================================
// FrostForm — Quiz Types
// ============================================================

export type QuizStep =
  | 'gate'
  | 'name'
  | 'profile'
  | 'objectives'
  | 'experience'
  | 'reseller'
  | 'info-origem'
  | 'info-frete'
  | 'info-prazo'
  | 'info-alfandega'
  | 'final'
  | 'rejected';

export type ProfileType = 'uso_pessoal' | 'profissional_saude' | 'revendedor';

export type ObjectiveType =
  | 'gordura'
  | 'massa'
  | 'estetica'
  | 'sono'
  | 'energia'
  | 'longevidade'
  | 'foco';

export type ExperienceType =
  | 'nunca_usei'
  | 'pesquisei'
  | 'ja_usei'
  | 'uso_ha_tempo';

export type ResellerOperationType =
  | 'quero_comecar'
  | 'ja_vendo'
  | 'estrutura_montada'
  | 'atendo_clinicas';

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  value: string;
}

export interface QuizQuestion {
  id: QuizStep;
  title: string;
  subtitle?: string;
  introText?: string;
  type: 'single_choice' | 'multi_select' | 'text' | 'phone';
  options?: QuizOption[];
  required: boolean;
}

export interface QuizAnswers {
  intencao: string;
  nome: string;
  whatsapp: string;
  perfil: ProfileType | '';
  objetivos: ObjectiveType[];
  experiencia: ExperienceType | '';
  operacao_revenda: ResellerOperationType | '';
  data_envio: string;
}

export interface QuizState {
  currentStep: QuizStep;
  answers: QuizAnswers;
  stepHistory: QuizStep[];
  isSubmitting: boolean;
  isComplete: boolean;
}

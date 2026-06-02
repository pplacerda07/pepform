// ============================================================
// FrostForm — Definição das Perguntas do Quiz
// ============================================================

import { QuizQuestion } from '@/types/quiz';

export interface InfoCard {
  icon: string;
  badge: string;
  title: string;
  body: string;
  buttonLabel: string;
  showWarningHeader?: boolean;
}

export const infoCards: Record<string, InfoCard> = {
  'info-origem': {
    icon: '🏭',
    badge: 'Origem do produto',
    title: 'Nossa fábrica fica em Hong Kong.',
    body: 'Não temos estoque no Brasil. Cada pedido sai direto da fábrica para o seu endereço. É exatamente por isso que conseguimos o preço que oferecemos.',
    buttonLabel: 'Entendi',
    showWarningHeader: true,
  },
  'info-frete': {
    icon: '✈️',
    badge: 'Frete fixo internacional',
    title: 'US$ 75 fixos para qualquer cidade do Brasil.',
    body: 'Esse valor já inclui envio expresso, rastreio e garantia de reenvio. Não importa de onde você é.',
    buttonLabel: 'Entendi',
  },
  'info-prazo': {
    icon: '📦',
    badge: 'Prazo de envio',
    title: 'Postamos em até 3 dias úteis após o pagamento.',
    body: 'Você recebe o código de rastreio assim que o pacote sai, e nossa equipe acompanha o rastreio junto com você até a entrega, que leva cerca de 20 dias após o envio.',
    buttonLabel: 'Entendi',
  },
  'info-alfandega': {
    icon: '🛂',
    badge: 'Alfândega e reembolso',
    title: 'Chance de apreensão é muito baixa.',
    body: 'Temos rotas dedicadas de envio que garantem a chegada do seu pedido. Apreensão acontece em menos de 5% dos casos. E se acontecer com o seu, a gente reenvia ou devolve o seu dinheiro. Sem enrolação.',
    buttonLabel: 'Entendi a política de reembolso',
  },
};

export const questions: Record<string, QuizQuestion> = {
  gate: {
    id: 'gate',
    title: 'Você tem intenção real de adquirir peptídeos nos próximos 30 dias?',
    introText:
      'Trabalhamos em parceria direta com uma fábrica em Hong Kong — a mesma que abastece distribuidores na Europa e nos EUA. Nosso contato é fechado, nossa lista é privada, e a vaga para novos clientes é limitada todo mês.\n\nNão respondemos curiosos. Não mandamos lista para quem está "só pesquisando". Se esse for o seu caso, esse formulário não é pra você.',
    type: 'single_choice',
    required: true,
    options: [
      {
        id: 'gate_sim',
        label: 'Sim, quero acessar a lista e os preços',
        emoji: '✅',
        value: 'sim',
      },
      {
        id: 'gate_nao',
        label: 'Estou apenas pesquisando no momento',
        emoji: '❌',
        value: 'nao',
      },
    ],
  },

  name: {
    id: 'name',
    title: 'Como podemos te chamar?',
    type: 'text',
    required: true,
  },

  profile: {
    id: 'profile',
    title: 'O que descreve melhor a sua situação?',
    type: 'single_choice',
    required: true,
    options: [
      {
        id: 'perfil_pessoal',
        label: 'Quero peptídeos para uso pessoal',
        emoji: '🧍',
        value: 'uso_pessoal',
      },
      {
        id: 'perfil_saude',
        label: 'Sou profissional da saúde e indico/uso com pacientes',
        emoji: '🏥',
        value: 'profissional_saude',
      },
      {
        id: 'perfil_revenda',
        label: 'Quero revender ou já revendo suplementos / produtos do tipo',
        emoji: '📦',
        value: 'revendedor',
      },
    ],
  },

  objectives: {
    id: 'objectives',
    title: 'Qual é o resultado que você quer alcançar?',
    subtitle:
      'Pode marcar mais de um. Cada objetivo tem peptídeos específicos — vamos te indicar os certos.',
    type: 'multi_select',
    required: true,
    options: [
      {
        id: 'obj_gordura',
        label: 'Queimar gordura / emagrecer',
        emoji: '🔥',
        value: 'gordura',
      },
      {
        id: 'obj_massa',
        label: 'Ganhar massa muscular e força',
        emoji: '💪',
        value: 'massa',
      },
      {
        id: 'obj_estetica',
        label: 'Melhorar pele, cabelo e estética',
        emoji: '✨',
        value: 'estetica',
      },
      {
        id: 'obj_sono',
        label: 'Dormir melhor e recuperar mais rápido',
        emoji: '😴',
        value: 'sono',
      },
      {
        id: 'obj_energia',
        label: 'Aumentar energia e libido',
        emoji: '⚡',
        value: 'energia',
      },
      {
        id: 'obj_longevidade',
        label: 'Longevidade e antienvelhecimento',
        emoji: '🧬',
        value: 'longevidade',
      },
      {
        id: 'obj_foco',
        label: 'Foco mental e performance cognitiva',
        emoji: '🧠',
        value: 'foco',
      },
    ],
  },

  experience: {
    id: 'experience',
    title: 'Qual é a sua experiência com peptídeos?',
    subtitle: 'Isso muda o que vamos te recomendar.',
    type: 'single_choice',
    required: true,
    options: [
      {
        id: 'exp_nunca',
        label: 'Nunca usei, quero começar do jeito certo',
        emoji: '🌱',
        value: 'nunca_usei',
      },
      {
        id: 'exp_pesquisei',
        label: 'Já pesquisei bastante, agora quero usar',
        emoji: '🔍',
        value: 'pesquisei',
      },
      {
        id: 'exp_ja_usei',
        label: 'Já usei antes, quero um fornecedor melhor',
        emoji: '🔄',
        value: 'ja_usei',
      },
      {
        id: 'exp_uso_tempo',
        label: 'Uso há tempo e procuro preço de fábrica',
        emoji: '🏭',
        value: 'uso_ha_tempo',
      },
    ],
  },

  reseller: {
    id: 'reseller',
    title: 'Conta um pouco sobre a sua operação.',
    subtitle:
      'Para revendedores temos tabela diferenciada, com margem que ninguém no Brasil consegue oferecer.',
    type: 'single_choice',
    required: true,
    options: [
      {
        id: 'rev_comecar',
        label: 'Quero começar agora, ainda não vendo',
        emoji: '🚀',
        value: 'quero_comecar',
      },
      {
        id: 'rev_ja_vendo',
        label: 'Já vendo, busco fornecedor melhor',
        emoji: '🔄',
        value: 'ja_vendo',
      },
      {
        id: 'rev_estrutura',
        label: 'Tenho estrutura montada e quero volume',
        emoji: '🏢',
        value: 'estrutura_montada',
      },
      {
        id: 'rev_clinicas',
        label: 'Atendo clínicas, academias ou profissionais',
        emoji: '🏥',
        value: 'atendo_clinicas',
      },
    ],
  },
};

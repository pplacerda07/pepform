'use client';

import { QuizAnswers } from '@/types/quiz';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_NUMBER = '556781082674';

const PROFILE_LABELS: Record<string, string> = {
  uso_pessoal: 'Uso pessoal',
  profissional_saude: 'Profissional da saúde',
  revendedor: 'Revendedor',
};

const OBJECTIVE_LABELS: Record<string, string> = {
  gordura: 'Queimar gordura',
  massa: 'Ganhar massa muscular',
  estetica: 'Estética (pele, cabelo)',
  sono: 'Dormir melhor',
  energia: 'Energia e libido',
  longevidade: 'Longevidade',
  foco: 'Foco mental',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  nunca_usei: 'Nunca usei, quero começar do jeito certo',
  pesquisei: 'Já pesquisei bastante',
  ja_usei: 'Já usei antes, quero um fornecedor melhor',
  uso_ha_tempo: 'Uso há tempo, procuro preço de fábrica',
};

const RESELLER_LABELS: Record<string, string> = {
  quero_comecar: 'Quero começar agora',
  ja_vendo: 'Já vendo, busco fornecedor melhor',
  estrutura_montada: 'Tenho estrutura montada',
  atendo_clinicas: 'Atendo clínicas / academias',
};

function buildWhatsAppMessage(answers: QuizAnswers): string {
  const lines: string[] = [
    `Olá! Sou ${answers.nome}, acabei de preencher o formulário e tenho interesse na lista de peptídeos.`,
    '',
    `*Perfil:* ${PROFILE_LABELS[answers.perfil] || answers.perfil}`,
  ];

  if (answers.objetivos && answers.objetivos.length > 0) {
    const objs = answers.objetivos
      .map((o) => OBJECTIVE_LABELS[o] || o)
      .join(', ');
    lines.push(`*Objetivos:* ${objs}`);
  }

  if (answers.experiencia) {
    lines.push(`*Experiência:* ${EXPERIENCE_LABELS[answers.experiencia] || answers.experiencia}`);
  }

  if (answers.operacao_revenda) {
    lines.push(`*Operação:* ${RESELLER_LABELS[answers.operacao_revenda] || answers.operacao_revenda}`);
  }

  lines.push('');
  lines.push('Já li e entendi tudo sobre a operação:');
  lines.push('▸ Fábrica em Hong Kong');
  lines.push('▸ Frete fixo US$ 75');
  lines.push('▸ Postagem em até 3 dias úteis, entrega em ~20 dias');
  lines.push('▸ Política de reembolso/reenvio em caso de apreensão');
  lines.push('');
  lines.push('Aguardo o contato com a lista e os preços.');

  return lines.join('\n');
}

interface FinalScreenProps {
  answers: QuizAnswers;
  onReject: () => void;
}

export default function FinalScreen({ answers, onReject }: FinalScreenProps) {
  const message = buildWhatsAppMessage(answers);
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const handleInterest = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: 'Frost Peptideos Form - Qualified',
        content_category: answers.perfil,
      });
      console.log('[FrostForm] Meta Pixel: Lead qualificado disparado');
    }
  };

  return (
    <div className="question-card animate-in">
      <div className="warning-screen">
        <div className="warning-badge">CONFIRMAÇÃO FINAL</div>

        <p className="warning-body">
          ✅ Você leu sobre origem, frete, prazo e alfândega.
          Se está ciente e quer prosseguir, libere a conversa no WhatsApp abaixo.
          Pedimos que vá em frente só se realmente tiver intenção de comprar.
        </p>

        <div className="warning-buttons">
          <a
            href={whatsappLink}
            className="btn btn-primary btn-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInterest}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Tenho interesse
          </a>

          <button className="btn btn-secondary" onClick={onReject} type="button">
            Agora não
          </button>
        </div>

        <p className="warning-note">
          🔒 Lista privada. Pedimos discrição.
        </p>
      </div>
    </div>
  );
}

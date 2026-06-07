// ============================================================
// FrostForm — Integração com Google Sheets
// ============================================================

import { google } from 'googleapis';
import { QuizAnswers } from '@/types/quiz';

/**
 * Colunas da planilha:
 * A: Data/Hora do envio
 * B: Nome
 * C: WhatsApp
 * D: Perfil (uso_pessoal | profissional_saude | revendedor)
 * E: Objetivos (separados por vírgula)
 * F: Experiência
 * G: Operação de Revenda
 * H: Intenção
 * I: Canal (A | B) — round-robin baseado no número da linha
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error(
      'Missing Google Sheets environment variables. ' +
      'Please set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID in .env.local'
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
}

/**
 * Formata os objetivos como uma string legível.
 */
function formatObjectives(objetivos: string[]): string {
  const labels: Record<string, string> = {
    gordura: 'Queimar gordura',
    massa: 'Ganhar massa',
    estetica: 'Estética',
    sono: 'Dormir melhor',
    energia: 'Energia/Libido',
    longevidade: 'Longevidade',
    foco: 'Foco mental',
  };

  return objetivos.map((obj) => labels[obj] || obj).join(', ');
}

/**
 * Formata o perfil como texto legível.
 */
function formatProfile(perfil: string): string {
  const labels: Record<string, string> = {
    uso_pessoal: 'Uso Pessoal',
    profissional_saude: 'Profissional da Saúde',
    revendedor: 'Revendedor',
  };
  return labels[perfil] || perfil;
}

/**
 * Formata a experiência como texto legível.
 */
function formatExperience(experiencia: string): string {
  const labels: Record<string, string> = {
    nunca_usei: 'Nunca usou',
    pesquisei: 'Pesquisou bastante',
    ja_usei: 'Já usou antes',
    uso_ha_tempo: 'Usa há tempo',
  };
  return labels[experiencia] || experiencia;
}

/**
 * Formata a operação de revenda como texto legível.
 */
function formatResellerOp(operacao: string): string {
  if (!operacao) return '—';
  const labels: Record<string, string> = {
    quero_comecar: 'Quer começar',
    ja_vendo: 'Já vende',
    estrutura_montada: 'Estrutura montada',
    atendo_clinicas: 'Atende clínicas/academias',
  };
  return labels[operacao] || operacao;
}

/**
 * Cria o header da planilha se não existir.
 */
export async function ensureSheetHeader(): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

  // Verificar se já tem header completo com 9 colunas
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A1:I1',
  });

  const headerRow = existing.data.values?.[0] || [];
  if (headerRow.length < 9) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Data/Hora',
          'Nome',
          'WhatsApp',
          'Perfil',
          'Objetivos',
          'Experiência',
          'Operação Revenda',
          'Intenção',
          'Canal',
        ]],
      },
    });
  }
}

/**
 * Envia as respostas do quiz para a planilha Google Sheets.
 * Calcula o canal A/B com round-robin baseado na contagem de linhas.
 * Sempre retorna um canal, mesmo em caso de erro (fallback aleatório).
 */
export async function appendToSheet(
  data: QuizAnswers
): Promise<{ success: boolean; channel: 'A' | 'B'; error?: string }> {
  // Fallback caso a planilha falhe completamente
  let channel: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

    // Garantir que o header existe (9 colunas)
    await ensureSheetHeader();

    // Conta quantas linhas existem (incluindo header) para round-robin
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:A',
    });
    const totalRows = colA.data.values?.length || 1;
    // totalRows = 1 → próximo lead será linha 2 (lead nº 1) → A
    // totalRows = 2 → próximo lead será linha 3 (lead nº 2) → B
    channel = totalRows % 2 === 1 ? 'A' : 'B';

    // Montar a linha de dados (9 colunas)
    const row = [
      data.data_envio || new Date().toISOString(),
      data.nome,
      data.whatsapp,
      formatProfile(data.perfil),
      formatObjectives(data.objetivos),
      formatExperience(data.experiencia),
      formatResellerOp(data.operacao_revenda),
      data.intencao === 'sim' ? 'Sim' : 'Não',
      `Canal ${channel}`,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Dados enviados para Google Sheets (Canal ${channel})`);
    return { success: true, channel };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao enviar para Google Sheets:', message);
    return { success: false, channel, error: message };
  }
}

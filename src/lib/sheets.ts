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

  // Verificar se já tem dados
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A1:H1',
  });

  if (!existing.data.values || existing.data.values.length === 0) {
    // Criar header
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:H1',
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
        ]],
      },
    });
  }
}

/**
 * Envia as respostas do quiz para a planilha Google Sheets.
 * Retorna { success: true } ou { success: false, error: string }.
 */
export async function appendToSheet(
  data: QuizAnswers
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

    // Garantir que o header existe
    await ensureSheetHeader();

    // Montar a linha de dados
    const row = [
      data.data_envio || new Date().toISOString(),
      data.nome,
      data.whatsapp,
      formatProfile(data.perfil),
      formatObjectives(data.objetivos),
      formatExperience(data.experiencia),
      formatResellerOp(data.operacao_revenda),
      data.intencao === 'sim' ? 'Sim' : 'Não',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Dados enviados para Google Sheets com sucesso');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao enviar para Google Sheets:', message);
    return { success: false, error: message };
  }
}

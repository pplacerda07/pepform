// ============================================================
// FrostForm — API Route para envio de respostas
// Integrado com Google Sheets
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/sheets';
import { QuizAnswers } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    const data: QuizAnswers = await request.json();

    // Validação básica dos campos obrigatórios
    if (!data.nome || !data.whatsapp || !data.perfil || !data.intencao) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Log dos dados recebidos (para debug)
    console.log('=== NOVA SUBMISSÃO FROSTFORM ===');
    console.log('Data:', data.data_envio || new Date().toISOString());
    console.log('Nome:', data.nome);
    console.log('WhatsApp:', data.whatsapp);
    console.log('Perfil:', data.perfil);
    console.log('Objetivos:', data.objetivos?.join(', ') || 'N/A');
    console.log('Experiência:', data.experiencia);
    console.log('Operação Revenda:', data.operacao_revenda || 'N/A');
    console.log('================================');

    // Enviar para Google Sheets
    const sheetsResult = await appendToSheet(data);

    if (!sheetsResult.success) {
      console.error('Google Sheets error:', sheetsResult.error);
      // Retorna sucesso pro usuário mesmo se falhar o Sheets
      // Os dados já foram logados no servidor
      return NextResponse.json(
        { 
          success: true, 
          message: 'Formulário recebido (planilha temporariamente indisponível)',
          sheetsError: sheetsResult.error 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Formulário recebido e salvo na planilha' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar submissão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar formulário' },
      { status: 500 }
    );
  }
}

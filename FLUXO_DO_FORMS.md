# Fluxo do Formulário — Frost Peptídeos

Documentação completa de como o formulário funciona, desde a primeira tela até o redirecionamento final no WhatsApp.

---

## 1. Visão Geral

O formulário é um funil de qualificação em 3 fases:

1. **Qualificação:** filtra interesse e perfila o lead
2. **Educação:** explica origem, frete, prazo e alfândega
3. **Confirmação:** redireciona pro WhatsApp do canal correspondente

Tudo roda no client (Next.js 16 App Router, React 19) com submissão no final via API Route, que grava no Google Sheets e calcula o canal de atendimento.

---

## 2. Fluxo de Telas (Step-by-step)

```
[INTRO LANDING]
       ↓ Verificar disponibilidade
[gate]                  ← "Tem intenção real nos próximos 30 dias?"
       ↓ Sim                    Não → [rejected]
[profile]               ← "Qual descreve sua situação?"
       ↓
   ┌───┴──── revendedor → [reseller] → [experience]
   │
   └─── outros → [objectives] → [experience]
       ↓
[experience]            ← "Qual sua experiência com peptídeos?"
       ↓
[name]                  ← "Como podemos te chamar?"
       ↓
[info-origem]           ← ⚠️ "Leia antes de continuar" + 🏭 fábrica em HK
       ↓ Entendi
[info-frete]            ← ✈️ US$ 75 fixo
       ↓ Entendi
[info-prazo]            ← 📦 3 dias úteis + ~20 dias
       ↓ Entendi
[info-alfandega]        ← 🛂 política de reembolso
       ↓ Entendi a política de reembolso
                          ┌─ Submete para a planilha
                          ├─ Calcula canal (A ou B)
                          └─ Dispara `CompleteRegistration` no Pixel
       ↓
[final]                 ← ✅ "Confirmação Final"
       ↓
   ┌───┴───────────────────────────┐
   ↓                               ↓
[Tenho interesse]             [Agora não]
   ↓ Dispara `Lead` no Pixel       ↓
   ↓ Abre wa.me com mensagem       ↓
   ↓ pré-pronta no canal sorteado  ↓
   ✅ Atendimento                  [rejected]
```

---

## 3. Descrição de Cada Tela

### 3.1 Intro Landing
- Logo + headline "Os peptídeos que profissionais usam. Preço de fábrica."
- Pills com prova ("Laudos", "Rastreio", "40–70% abaixo")
- Botão "Verificar Disponibilidade" inicia o quiz

### 3.2 `gate` — Verificação de intenção
- Pergunta se tem intenção real nos próximos 30 dias
- **Sim** → segue para `profile`
- **Não** → `rejected` (tela de "esse meio não é pra você")

### 3.3 `profile` — Perfil
- 3 opções: Uso pessoal / Profissional da saúde / Revendedor
- Auto-avança no clique
- **Revendedor** → vai pra `reseller`
- **Outros** → vai pra `objectives`

### 3.4 `reseller` — Operação de Revenda (só revendedor)
- 4 opções: Quero começar / Já vendo / Estrutura montada / Atendo clínicas
- Auto-avança → vai pra `experience`

### 3.5 `objectives` — Objetivos (não-revendedor)
- Múltipla escolha: gordura, massa, estética, sono, energia, longevidade, foco
- Requer pelo menos 1 selecionado
- Botão "Continuar" → vai pra `experience`

### 3.6 `experience` — Experiência com peptídeos
- 4 opções: Nunca usei / Já pesquisei / Já usei / Uso há tempo
- Auto-avança → vai pra `name`

### 3.7 `name` — Nome
- Input de texto livre (mínimo 2 caracteres)
- Botão "Continuar" → inicia educação

### 3.8 `info-origem` — Card 1 (com header "⚠️ Leia antes de continuar")
- 🏭 Origem do produto
- "Nossa fábrica fica em Hong Kong. Não temos estoque no Brasil..."
- Botão "Entendi" → `info-frete`

### 3.9 `info-frete` — Card 2
- ✈️ Frete fixo internacional
- "US$ 75 fixos para qualquer cidade do Brasil..."
- Botão "Entendi" → `info-prazo`

### 3.10 `info-prazo` — Card 3
- 📦 Prazo de envio
- "Postamos em até 3 dias úteis... entrega em ~20 dias..."
- Botão "Entendi" → `info-alfandega`

### 3.11 `info-alfandega` — Card 4 (último, dispara submit)
- 🛂 Alfândega e reembolso
- "Apreensão acontece em menos de 5%... a gente reenvia ou devolve..."
- Botão "Entendi a política de reembolso" → **submete tudo e vai pra `final`**

### 3.12 `final` — Confirmação Final
- Badge "CONFIRMAÇÃO FINAL"
- Mensagem: "Você leu sobre origem, frete, prazo e alfândega..."
- 2 botões:
  - 🟢 **Tenho interesse** → abre WhatsApp do canal sorteado com mensagem pronta + dispara `Lead`
  - **Agora não** → `rejected`

### 3.13 `rejected` — Tela de saída
- Mostrada se: respondeu "Não" no `gate`, ou clicou "Agora não" no `final`
- Tem botão pra reiniciar o quiz

---

## 4. Distribuição de Canais (Round-Robin 50/50)

Os leads são distribuídos entre **2 números de WhatsApp** de forma exata e persistente.

### 4.1 Como funciona

A planilha do Google Sheets é o "contador" central:

| Lead nº | Linha planilha | Canal | Número (`wa.me/...`) |
|---------|----------------|-------|----------------------|
| 1 | 2 | A | `556781082674` |
| 2 | 3 | B | `556731990990` |
| 3 | 4 | A | `556781082674` |
| 4 | 5 | B | `556731990990` |
| ... | ... | ... | ... |

**Regra:** linha par (após o header) → canal A · linha ímpar → canal B.

### 4.2 Por que esse método

- ✅ **Exato 50/50** — não depende de probabilidade (`Math.random`)
- ✅ **Persistente** — sobrevive a deploy, reset, etc.
- ✅ **Auditável** — a coluna "Canal" na planilha mostra pra onde cada lead foi
- ✅ **Sem custo extra** — usa infra que já existe
- ⚠️ **Fallback** — se a planilha falhar, sorteia aleatoriamente (`Math.random`) pra não travar o fluxo

### 4.3 Onde mexer os números

`src/components/Quiz/FinalScreen.tsx`:

```ts
const WHATSAPP_NUMBERS: Record<'A' | 'B', string> = {
  A: '556781082674',
  B: '556731990990',
};
```

Formato: `[55][DDD][número]` sem espaços, hífens ou `+`.

---

## 5. Mensagem Pré-pronta no WhatsApp

Quando o lead clica em "Tenho interesse", o `wa.me/...` é aberto com a mensagem montada a partir das respostas. Exemplo de mensagem:

```
Olá! Sou João Silva, acabei de preencher o formulário e tenho 
interesse na lista de peptídeos.

*Perfil:* Uso pessoal
*Objetivos:* Queimar gordura, Energia e libido
*Experiência:* Nunca usei, quero começar do jeito certo

Já li e entendi tudo sobre a operação:
▸ Fábrica em Hong Kong
▸ Frete fixo US$ 75
▸ Postagem em até 3 dias úteis, entrega em ~20 dias
▸ Política de reembolso/reenvio em caso de apreensão

Aguardo o contato com a lista e os preços.
```

Asteriscos (`*texto*`) viram **negrito** no WhatsApp.

Código que monta: função `buildWhatsAppMessage()` em `src/components/Quiz/FinalScreen.tsx`.

---

## 6. Google Sheets (Persistência)

### 6.1 Colunas

| Col | Cabeçalho | Conteúdo |
|-----|-----------|----------|
| A | Data/Hora | ISO timestamp do envio |
| B | Nome | nome do lead |
| C | WhatsApp | (atualmente vazio — step removido) |
| D | Perfil | Uso Pessoal / Profissional da Saúde / Revendedor |
| E | Objetivos | "Queimar gordura, Energia e libido, ..." |
| F | Experiência | Nunca usou / Pesquisou bastante / Já usou / Usa há tempo |
| G | Operação Revenda | (preenchido só se perfil = revendedor) |
| H | Intenção | Sim / Não |
| I | Canal | Canal A / Canal B |

### 6.2 Configuração

3 variáveis de ambiente (`.env.local` localmente, painel Settings na Vercel):

```
GOOGLE_SHEETS_CLIENT_EMAIL=<service-account>@<projeto>.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=<id da planilha extraído da URL>
```

A conta de serviço precisa estar compartilhada na planilha com permissão de **Editor**.

### 6.3 Header automático

A primeira execução cria o header com as 9 colunas automaticamente. Se a planilha já tem header parcial (8 colunas), atualiza pra 9 e adiciona "Canal".

Implementação: `ensureSheetHeader()` em `src/lib/sheets.ts`.

---

## 7. Meta Pixel — Eventos de Conversão

| Momento | Evento | Parâmetros |
|---------|--------|------------|
| Abre o site | `PageView` | (automático no layout) |
| Clica "Entendi a política" (último card) | `CompleteRegistration` | `content_name`, `content_category: <perfil>`, `content_id: canal-a/canal-b` |
| Clica "Tenho interesse" (vai pro WhatsApp) | `Lead` | `content_name`, `content_category: <perfil>`, `content_id: canal-a/canal-b` |
| Clica "Agora não" | nenhum | — |

### 7.1 Como usar nos Ads

- **Campanha de volume / aquecimento:** otimize por `CompleteRegistration`
- **Campanha de qualidade / conversão (recomendado):** otimize por `Lead`
- **Comparar canais:** segmente o relatório por `content_id` no Ads Manager → mostra performance de cada canal de atendimento

### 7.2 Onde mexer o Pixel ID

`src/app/layout.tsx`:

```ts
const META_PIXEL_ID = '26531423439887099';
```

---

## 8. Lógica de Roteamento (código)

Definida em `src/lib/quiz-logic.ts` em 3 funções:

- `getNextStep(currentStep, answers)` — qual é o próximo step
- `getPreviousStep(currentStep, answers)` — qual é o anterior (botão voltar)
- `validateStep(step, answers)` — se pode avançar (campo preenchido)

Steps possíveis (`QuizStep`): `gate | profile | objectives | reseller | experience | name | info-origem | info-frete | info-prazo | info-alfandega | final | rejected`.

---

## 9. Estrutura de Arquivos Relevantes

```
frostform/
├── src/
│   ├── app/
│   │   ├── api/submit/route.ts   ← endpoint POST que grava na planilha
│   │   ├── layout.tsx            ← Pixel + metadata + fonte
│   │   ├── page.tsx              ← carrega o QuizContainer
│   │   └── globals.css           ← design system completo
│   ├── components/Quiz/
│   │   ├── QuizContainer.tsx     ← orquestrador de steps
│   │   ├── SingleChoice.tsx
│   │   ├── MultiSelect.tsx
│   │   ├── TextInput.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── FinalScreen.tsx       ← tela final + WhatsApp link + Pixel Lead
│   │   └── RejectionScreen.tsx
│   ├── lib/
│   │   ├── questions.ts          ← textos das perguntas e info cards
│   │   ├── quiz-logic.ts         ← roteamento e validação
│   │   └── sheets.ts             ← integração Google Sheets
│   └── types/quiz.ts             ← tipos QuizStep, QuizAnswers, etc.
└── .env.local                    ← credenciais (não commitado)
```

---

## 10. Mudanças Comuns (cheat sheet)

| Quero mudar | Arquivo | O que procurar |
|-------------|---------|----------------|
| Texto de uma pergunta | `src/lib/questions.ts` | objeto `questions` |
| Texto de um info card | `src/lib/questions.ts` | objeto `infoCards` |
| Ordem dos steps | `src/lib/quiz-logic.ts` | `getNextStep` |
| Número do WhatsApp | `src/components/Quiz/FinalScreen.tsx` | `WHATSAPP_NUMBERS` |
| Mensagem pré-pronta | `src/components/Quiz/FinalScreen.tsx` | `buildWhatsAppMessage` |
| Pixel ID | `src/app/layout.tsx` | `META_PIXEL_ID` |
| Cores / tema | `src/app/globals.css` | bloco `:root` |
| Layout do intro | `src/components/Quiz/QuizContainer.tsx` | função `IntroScreen` |
| Texto da tela de aviso final | `src/components/Quiz/FinalScreen.tsx` | string em `.warning-body` |

---

## 11. Deploy

- **Repositório:** `https://github.com/pplacerda07/pepform`
- **Plataforma:** Vercel
- **Branch deploy:** `main`
- **Variáveis de ambiente** precisam estar configuradas no painel da Vercel (Settings → Environment Variables): as 3 do Google Sheets

Cada push em `main` dispara redeploy automático.

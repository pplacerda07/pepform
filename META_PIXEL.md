# Meta Pixel — Estrutura no Frost Peptídeos

Documentação técnica de como o Pixel da Meta está implementado, onde dispara cada evento, quais parâmetros vão e como otimizar campanhas em cima disso.

---

## 1. Visão Rápida

| | |
|---|---|
| **Pixel ID** | `26531423439887099` |
| **Modo** | Pixel padrão (client-side JavaScript) |
| **API de Conversões (CAPI)** | ❌ não implementada (pode ser adicionada depois) |
| **Eventos disparados** | `PageView`, `CompleteRegistration`, `Lead` |
| **Onde fica o ID** | `src/app/layout.tsx`, constante `META_PIXEL_ID` |

---

## 2. Arquitetura

O Pixel é carregado **uma única vez** no `RootLayout` da aplicação. Como o Next.js App Router faz client-side navigation, o script base do Pixel persiste durante toda a sessão e fica disponível como `window.fbq()` em qualquer componente.

```
┌─────────────────────────────────────┐
│ src/app/layout.tsx                  │
│ • Carrega fbevents.js               │
│ • fbq('init', PIXEL_ID)             │
│ • fbq('track', 'PageView')          │  ← dispara automático
│ • Adiciona <noscript> fallback      │
└────────────┬────────────────────────┘
             │
             │ disponibiliza window.fbq() globalmente
             │
   ┌─────────┴─────────────┐
   ↓                       ↓
┌──────────────────┐  ┌──────────────────┐
│ QuizContainer    │  │ FinalScreen      │
│ ─────────────    │  │ ─────────────    │
│ Quando submete   │  │ No clique do     │
│ a planilha:      │  │ "Tenho           │
│                  │  │ interesse":      │
│ fbq('track',     │  │                  │
│   'Complete-     │  │ fbq('track',     │
│   Registration') │  │   'Lead')        │
└──────────────────┘  └──────────────────┘
```

---

## 3. Script Base — `src/app/layout.tsx`

O script padrão do Meta é injetado via `next/script` com `strategy="afterInteractive"`. Isso significa que o React monta a página primeiro, e o Pixel carrega logo depois — não bloqueia o render.

```tsx
import Script from 'next/script';

const META_PIXEL_ID = '26531423439887099';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Pontos importantes:**

- `strategy="afterInteractive"` → carrega após a hidratação do React, não atrasa o LCP
- `id="meta-pixel"` → garante que o Next renderiza só uma vez
- `<noscript>` → fallback para usuários sem JavaScript (raríssimo, mas a Meta recomenda)
- `PageView` dispara **automaticamente** assim que o script termina de carregar

---

## 4. Tipagem do `window.fbq`

Em cada componente que chama o Pixel, precisamos declarar globalmente que `window.fbq` existe pro TypeScript não reclamar:

```ts
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
```

Está duplicado em:
- `src/components/Quiz/QuizContainer.tsx`
- `src/components/Quiz/FinalScreen.tsx`

A declaração é **opcional** (`?`) e tipada como genérica, então não quebra se o script ainda não carregou.

---

## 5. Evento `PageView`

| | |
|---|---|
| **Quando dispara** | Automaticamente quando a página carrega |
| **Onde** | `src/app/layout.tsx`, dentro do script base |
| **Parâmetros** | nenhum (padrão da Meta) |

Esse é o evento mais básico — sinaliza pra Meta que alguém visitou o site. Serve pra:
- Construção de **público customizado** (retargetar visitantes)
- Cálculo de **CPC e taxa de conversão** das campanhas
- Verificação de que o Pixel está vivo (status "Ativo" no Events Manager)

---

## 6. Evento `CompleteRegistration`

| | |
|---|---|
| **Quando dispara** | Quando o usuário clica em "Entendi a política de reembolso" no último card educativo (`info-alfandega`) e a submissão da planilha retorna sucesso |
| **Onde** | `src/components/Quiz/QuizContainer.tsx`, dentro de `handleNext()` |
| **Parâmetros** | `content_name`, `content_category`, `content_id` |

### 6.1 Código

```ts
// QuizContainer.tsx, handleNext()
if (nextStep === 'final') {
  // ... submete pra planilha
  const json = await resp.json();
  if (json.channel === 'A' || json.channel === 'B') {
    setChannel(json.channel);
  }
  if (!resp.ok || !json.success) {
    console.error('[FrostForm] Falha na submissão:', json);
  } else {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        content_name: 'Frost Peptideos Form',
        content_category: answers.perfil,             // uso_pessoal | profissional_saude | revendedor
        content_id: `canal-${(json.channel || 'A').toLowerCase()}`, // canal-a | canal-b
      });
    }
  }
}
```

### 6.2 O que ele representa

`CompleteRegistration` é o **lead bruto**: a pessoa terminou de preencher tudo e leu sobre a operação. Ainda **não** confirmou intenção de fechar.

Usos típicos:
- Campanhas de **aquecimento / topo de funil** (CPM baixo, volume alto)
- Métrica de **taxa de conclusão** do formulário
- Base pra **lookalikes** de quem termina o quiz

---

## 7. Evento `Lead`

| | |
|---|---|
| **Quando dispara** | No clique em "Tenho interesse" na tela final (antes de abrir o WhatsApp) |
| **Onde** | `src/components/Quiz/FinalScreen.tsx`, função `handleInterest()` |
| **Parâmetros** | `content_name`, `content_category`, `content_id` |

### 7.1 Código

```ts
// FinalScreen.tsx
const handleInterest = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Frost Peptideos Form - Qualified',
      content_category: answers.perfil,
      content_id: `canal-${channel.toLowerCase()}`,
    });
  }
};

// ...

<a
  href={whatsappLink}
  className="btn btn-primary btn-whatsapp"
  target="_blank"
  rel="noopener noreferrer"
  onClick={handleInterest}   // ← dispara antes do browser seguir o href
>
  Tenho interesse
</a>
```

### 7.2 O que ele representa

`Lead` é o **lead qualificado de alta intenção**: a pessoa não só terminou o form, como confirmou que entendeu a operação E aceitou ir pro WhatsApp. Filtra automaticamente os curiosos que clicam em "Agora não".

Usos típicos:
- Campanhas de **conversão / fundo de funil** (CPC mais alto, qualidade alta)
- Otimização de leilão por **leads de alta intenção**
- Base pra **lookalikes premium** de quem realmente quer comprar

---

## 8. Parâmetros Customizados — O Que Cada Um Representa

| Parâmetro | Valor possível | Pra que serve |
|-----------|----------------|---------------|
| `content_name` | `"Frost Peptideos Form"` ou `"Frost Peptideos Form - Qualified"` | Distingue lead bruto de qualificado no relatório |
| `content_category` | `uso_pessoal`, `profissional_saude`, `revendedor` | Segmenta por **perfil** do lead. Você pode ver qual perfil converte mais |
| `content_id` | `canal-a`, `canal-b` | Segmenta por **canal de atendimento**. Você compara performance dos 2 números |

### 8.1 Como usar nos relatórios

No **Events Manager** ou **Ads Manager**:

1. Abra **Detalhamento** (Breakdown) no relatório de Eventos
2. Selecione **Conteúdo: ID** ou **Conteúdo: Categoria**
3. Veja a contagem por valor

Exemplo de insight que isso permite:
- `canal-a`: 47 Leads / `canal-b`: 53 Leads → distribuição saudável
- `uso_pessoal`: 60% das conversões → este perfil é o mais quente
- Se um canal tem 0% de Lead mas 30% de CompleteRegistration → o atendente A está convertendo melhor que o B (ou há bug no canal B)

---

## 9. Fluxo Completo de Eventos (Linha do Tempo)

```
T=0    Usuário abre /                       → 🎯 PageView
T=?    Preenche todos os steps até info-alfandega
T=?    Clica "Entendi a política"           → 🎯 CompleteRegistration
                                              (params: perfil + canal sorteado)
T=?    Tela de confirmação final
       ├─ Clica "Tenho interesse"           → 🎯 Lead
       │                                      (params: perfil + canal)
       │                                    → abre wa.me/<numero do canal>
       │
       └─ Clica "Agora não"                 → 🚫 nenhum evento
                                              (filtrado, não polui o Pixel)
```

---

## 10. Estratégia de Campanhas Recomendada

| Estágio | Objetivo | Evento de otimização | Custo esperado |
|---------|----------|----------------------|----------------|
| **Topo** | Aquecer + público | `PageView` | CPM baixo |
| **Meio** | Volume de leads brutos | `CompleteRegistration` | CPL médio |
| **Fundo** | Leads de alta intenção | `Lead` | CPL mais alto, mas qualidade alta |

**Dica:** comece otimizando por `CompleteRegistration` enquanto o pixel "aprende". Depois de ~50 conversões, mude pra `Lead` (precisa de volume mínimo pra otimizar bem).

---

## 11. Como Verificar se Está Funcionando

### 11.1 Modo "Test Events" no Events Manager

1. Vá em Events Manager → seu Pixel → aba **Eventos de Teste**
2. Cole a URL do seu site → abre uma janela conectada
3. Preencha o form normalmente
4. Os eventos vão aparecer em tempo real no painel

### 11.2 Via DevTools (sempre)

1. Abra o site no Chrome/Edge
2. F12 → aba **Network**
3. Filtre por `facebook.com/tr` ou `connect.facebook.net`
4. Você vai ver:
   - 1× requisição com `ev=PageView` ao carregar a página
   - 1× requisição com `ev=CompleteRegistration` ao terminar o form
   - 1× requisição com `ev=Lead` ao clicar em "Tenho interesse"

### 11.3 Via Console

O código loga cada disparo no console pra debug:

```
[FrostForm] Salvo na planilha: Formulário recebido e salvo na planilha
[FrostForm] Meta Pixel: CompleteRegistration disparado
[FrostForm] Meta Pixel: Lead qualificado (Canal A)
```

### 11.4 Extensão Meta Pixel Helper

Instale a extensão **Meta Pixel Helper** no Chrome. Ela mostra um badge com o número de eventos detectados na página, e listando cada um com seus parâmetros — útil pra confirmar que `content_id` e `content_category` estão chegando corretos.

---

## 12. Limitações Atuais e Próximos Passos

### ❌ Sem API de Conversões (CAPI)

Hoje só temos o Pixel client-side. Isso significa que:
- Safari/iOS pode bloquear até **40%** dos eventos por ITP (Intelligent Tracking Prevention)
- Adblockers bloqueiam ~10% dos eventos
- A qualidade do match com identidades da Meta cai

**Próximo passo natural:** implementar CAPI em paralelo. Quando isso for feito, cada `Lead` será enviado também pelo backend (via `/api/submit`), com `event_id` igual nos dois lados pra Meta deduplicar. Isso aumenta o match rate em 15-30%.

Estrutura sugerida:
1. Gerar um `event_id` no client antes do disparo
2. Mandar pro backend junto com os outros dados
3. Backend chama `https://graph.facebook.com/v18.0/{pixel-id}/events` com hash do email/telefone
4. Pixel client-side dispara com o **mesmo** `event_id`

### ❌ Sem Advanced Matching

A Meta consegue casar conversões com usuários melhor quando recebe dados hasheados (email, telefone, nome). Como hoje só coletamos nome no form, dá pra adicionar:

```js
fbq('init', PIXEL_ID, {
  fn: hashedFirstName,    // SHA-256 do primeiro nome
  // futuramente: em, ph, etc.
});
```

### ❌ Sem rastreamento de abandono por step

Hoje só rastreamos quem finaliza. Pra entender onde o lead desiste, daria pra disparar eventos custom (`fbq('trackCustom', 'StepCompleted', { step: 'experience' })`) em cada transição.

---

## 13. Mudanças Rápidas (cheat sheet)

| Quero mudar | Arquivo | O que procurar |
|-------------|---------|----------------|
| Pixel ID | `src/app/layout.tsx` | `META_PIXEL_ID` |
| Nome do evento `CompleteRegistration` | `src/components/Quiz/QuizContainer.tsx` | `'CompleteRegistration'` no `fbq()` |
| Nome do evento `Lead` | `src/components/Quiz/FinalScreen.tsx` | `'Lead'` no `fbq()` |
| Parâmetros extras nos eventos | `QuizContainer.tsx` / `FinalScreen.tsx` | objeto `{ content_name, ... }` |
| Quando disparar (timing) | `QuizContainer.tsx` `handleNext()` ou `FinalScreen.tsx` `handleInterest()` | bloco `if (window.fbq)` |

---

## 14. Referências Oficiais

- [Documentação do Pixel](https://www.facebook.com/business/help/952192354843755)
- [Lista de eventos padrão](https://www.facebook.com/business/help/402791146561655)
- [API de Conversões](https://developers.facebook.com/docs/marketing-api/conversions-api/)
- [Test Events](https://www.facebook.com/business/help/449630090244888)
- [Meta Pixel Helper (Chrome)](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

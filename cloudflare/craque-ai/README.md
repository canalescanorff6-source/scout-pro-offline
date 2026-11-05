# Craque Tático AI · V387 · Gemini + Cloudflare Worker

Proxy pessoal, separado do app offline. Sem chave do Gemini no Android/Windows, sem alterações automáticas em PP, fichas, Card IDs, elencos ou GitHub. Limite financeiro preventivo (reserva, não fatura).

## Configuração manual (contas externas)

1. Crie chave nova e dedicada do Gemini em https://aistudio.google.com/ .
2. Dentro desta pasta execute: npx wrangler d1 create craque-tatico-ai-usage (anote database_id).
3. Copie wrangler.toml.example para wrangler.toml; substitua somente o ID D1. Revise as origens Android https://localhost e Electron scout://app. PWA: adicione apenas URL exata do site.
4. Execute: npx wrangler d1 migrations apply craque-tatico-ai-usage --remote
5. Cadastre segredos interativamente no Cloudflare, nunca no GitHub:
   - npx wrangler secret put GEMINI_API_KEY
   - npx wrangler secret put APP_ACCESS_TOKEN (token aleatório exclusivo de 32+ caracteres; guarde em gerenciador de senhas).
6. Execute: npx wrangler deploy
7. No app abra Craque Tático AI, informe URL HTTPS do Worker e token. O token permanece apenas na memória da aba; não é persistido nem incluído em backup. Nunca insira chave Gemini no app.
8. Teste Verificar conexão, depois uma consulta curta; acompanhe cobrança real no AI Studio / Cloud Billing.

## Limites e custo

Modelo fixo: gemini-2.5-flash-lite. Preços de referência 04/11/2026: entrada US$ 0,10/milhão de tokens; saída US$ 0,40/milhão.
O Worker reserva antes de cada chamada custo conservador, incluindo no máximo 768 tokens de saída. Valor reservado não é a fatura: superestima alguns casos e não é reembolsado em falhas.
Bloqueios: até US$ 3,00 em reservas mensais (limite imposto no código), 60 consultas/dia e 1.500/mês.
A meta R$ 30/mês depende do câmbio, impostos, custos Cloudflare e outros usos do projeto Google. Portanto, NÃO é um teto financeiro garantido. Use projeto Google dedicado, pagamento pré-pago quando disponível, alertas e acompanhamento no provedor. Verifique as condições de uso de dados do plano gratuito antes de enviar detalhes privados.

## Contrato de segurança e dados

- GET /health público: só estado de configuração. GET /usage exige Authorization: Bearer TOKEN.
- POST /analyze exige Bearer e campos mode (carta/formacao/codigo), question e context. CORS restrito, sem segredo Gemini no cliente.
- D1 guarda somente reservas de orçamento e quantidade por dia/mês, nunca histórico ou cartões.
- Memória de correções local: scoutpro:ai:v387:corrections. Uma nota NÃO altera dados canônicos; envio ao Gemini só se o usuário marcar a opção.
- Auditoria de código: somente leitura de arquivos predefinidos do repositório público na branch main, com consentimento explícito.
- Offline do aplicativo continua independente; IA requer rede. Nenhum envio automático de toda coleção.
- O token de acesso compartilhado é para uso pessoal, não solução multiusuário. Rotacione após exposição. Limite de gastos é global ao Worker.
- Não colocar segredos nos arquivos web/, commits, logs ou screenshots.

## Testes

Na raiz: node --test scripts/test-craque-ai-v387.mjs
O PR deve ser testado em Android e Windows reais antes do merge/publicação. Código não comprova deploy, faturamento ou instalação.

# Scout PRO V202 — Hierarquia premium com conteúdo útil na primeira tela

## Referências disponíveis
A imagem original da proposta premium aprovada pelo usuário **não está disponível para uma comparação pixel a pixel**. Foram recuperadas as orientações textuais do projeto e as capturas reais da V201 (Android 320/360/390/412; Windows 1366/1920). O objetivo V202 é corrigir problemas mensuráveis da experiência atual, não declarar identidade com uma imagem ausente.

### Diagnóstico comprovado (V201)
- **Android 390 px:** a seção real do catálogo começava em Y=570,2 px e só se via seu filtro no fim da primeira tela; o hero trazia texto redundante e descrições repetidas em cada atalho.
- **Windows 1366 px:** a biblioteca de jogadores começava em Y=696,4 px num viewport de 768 px — quase abaixo da primeira dobra; o hero, mesmo com menu técnico recolhido, era alto.
- **Ficha Android 390 px:** o painel principal começava em Y=533,6 px, após cabeçalho de identidade, navegação, nome, edição e métricas.
- No celular, o título da home unia “CADA CARTA.SEU” ao esconder o `<br>` com `display:none`.

## Implementação
- Conserva a paleta azul-petróleo/grafite, turquesa suave e dourado pontual, com menos brilho e bordas consistentes.
- **Mobile:** título separado em duas linhas; parágrafo duplicado removido **só da exibição**; busca original mantida; quatro atalhos com nome e ícone em grid compacto de 2x2; metodologia e ferramentas permanecem clicáveis. O catálogo deve começar antes na tela.
- **Desktop:** hero de altura reduzida; quatro atalhos em **uma faixa horizontal**, com acesso rápido às cartas; arte original dos jogadores preservada à direita; menu Ferramentas continua funcionando. Catálogo visível mais cedo.
- **Ficha móvel:** imagem original compactada sem corte, navegação com três ações preservada, KPIs mais enxutos; PP/treino, ímpetos, cinco habilidades, biotipo e avaliações avançadas seguem na mesma ordem e com a mesma lógica.
- Nenhum arquivo de ficha, carta, atributos, PP, estilo, habilidade, ímpeto ou motor competitivo foi alterado. Não muda backup, atualização ou salva novas preferências.
- CSS de acabamento centralizado em `web/scout-finish-v202.css`, compartilhado por Android e Windows, armazenado offline e incluído no fingerprint de 27 fontes monitoradas.

## Critérios de validação
- Auditoria de 246 fichas e 246 artes.
- `npm run check` inclui `scripts/test-ui-v202.cjs` para impedir perda de atalhos, motores ou elementos originais.
- Capturas reais do Chromium em 320, 360, 390, 412, 1366 e 1920 px. Critérios: `#catalogo` Y<=545 em 320 px, Y<=525 nos outros celulares e Y<=610 em 1366/1920; painel `#scout-v188-principal` Y<=555 em 320 e Y<=520 nos demais celulares; nenhuma rolagem horizontal, quatro atalhos acessíveis, mesma navegação.
- No Android físico ainda é necessário testar a instalação e comparar com a imagem definitiva. CI GREEN valida funcionamento e regressão, **não prova igualdade visual absoluta**.

## Proteções
Os 246 jogadores, artes originais, os níveis, a distribuição de PP, o DNA competitivo, os ímpetos V200, pictogramas de treino V201, backups, Android/Windows e funcionamento offline permanecem intactos. A escolha do usuário continua final.

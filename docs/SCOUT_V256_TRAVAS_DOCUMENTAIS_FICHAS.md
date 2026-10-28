# Craque Tático — V255/V256 | Identidade, reservas e prova de PP por edição

## Objetivo

Evitar decisões apresentadas como competitivamente comprovadas quando o acervo não oferece dados suficientes. **Esta revisão não altera as 246 cartas, Card IDs, imagens, PP, builds, raridades, habilidades, ímpetos ou formações.** A análise é consultiva, respeitando Posse de Bola central como prioridade e mantendo os cinco estilos.

## Evidências e lacunas medidas no catálogo V69

- **246** edições originais.
- **85** edições possuem nível máximo e origem `informado_pelo_usuario_...`, com relação `PP = 2 × (nível − 1)` coerente.
- **161** edições carecem dessa origem documental, embora suas distribuições possam fechar matematicamente os PP informados. **Custo fechado NÃO valida PP da edição.**
- Das 85 edições com nível/documentação, **apenas uma** apresenta simultaneamente um vetor de treino válido e a soma matemática de PP correspondente no acervo da revisão. Isso **não** significa que esse treino esteja validado em partidas.
- As demais edições com nível documentado, mas sem treino vetorial válido, continuam disponíveis para conferência; **nenhuma build foi gerada ou substituída automaticamente**.

## Regra V256 aplicada no próprio motor V233

`levelDocumented(card)` só retorna verdadeiro quando:

1. `max_level` é inteiro de 1 a 120;
2. `card.pp === 2 × (max_level − 1)`;
3. nenhum indicador de PP estimado está ativo;
4. `pp_origem` começa por `informado_pelo_usuario_`.

Se qualquer requisito falhar, **`compare()` não devolve proposta de redistribuição**. A análise de papel e atributos prioritários pode continuar, com estado de evidência `pendente`, e a tela mostra a pendência. Uma importação manual V248/V250 não altera o catálogo canônico automaticamente; o motor V251 mantém a verificação específica dessa conferência local.

## Regra V255 aplicada no orientador de reservas

- Identidade da **pessoa**, não só da edição da carta: não recomendar uma versão do mesmo jogador para substituir outra.
- Não usar posição não confirmada por original/familiaridade/treino V246.
- Não calcular diferença de qualidade artificial quando o titular está escalado numa posição não confirmada: priorizar **correção posicional**, não inferência de desempenho.
- Distinguir **correção de posição**, **encaixe documental favorável** e **alternativa sem vantagem comprovada**.
- Informar **posição de entrada e CAP/nome de quem sai** nas duas formações V177, no plano V176 e no rodízio.
- Não inferir Player ID corporal nem tratar Overall como evidência.

## Próxima etapa necessária para otimização real

Para cada edição prioritária, conferir prints/vídeos do **Card ID exato**, nível máximo, atributos-base, habilidades nativas/adicionais, ímpetos, posicionamento realmente familiar/treinado e testes comparáveis em partidas. Somente após essa confirmação comparar builds de mesmos PP, respeitando o custo progressivo por categoria, a função no time e a Posse central. **Não atribuir uma build ao Rentão ou Blackjhon sem fonte da mesma edição.**

## Testes

- `scripts/test-progress-bench-v247.cjs`
- `scripts/test-bench-identity-evidence-v255.cjs`
- `scripts/test-craque-role-intelligence-v233.cjs`
- `scripts/test-level-proof-v256.cjs`
- `scripts/qa-visual-v195.py` para os fluxos do navegador, com Windows e Android em diferentes viewports.

As alterações precisam permanecer em PR até CI, QA visual e compilações de teste estarem verdes. Publicar EXE/APK somente quando a release assinada estiver confirmada.

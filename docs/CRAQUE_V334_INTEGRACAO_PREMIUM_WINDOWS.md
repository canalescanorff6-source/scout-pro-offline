# Craque Tático — V334 · Pré-integração Premium e atualizador Windows

## Base verificada
- Base oficial da main: V331 / release v1.1.938.
- V332: PR #245, CI e QA aprovados separadamente, ainda não integrado.
- V333: PR #246, CI e QA aprovados separadamente, ainda não integrado.
- Esta branch nasce do HEAD de V333 e incorpora os arquivos da V332 **sem merge em main**.

## Defeito identificado ao integrar
A tela inicial real é o componente `scout-v189-home` / `scout-v189-extra`.
A `hero-actions` antiga existe, mas é ocultada pelo CSS V192 e é usada como fonte
para a navegação Premium. Portanto, testes sobre a hero antiga não provam que
links dinâmicos ficam disponíveis na navegação visível.

Além disso, `pwa.js` adicionava links após o carregamento, podendo deixá-los
na hero oculta quando `scout-ui-v189.js` já tinha montado a navegação.
A Central de Técnicos poderia aparecer mais de uma vez se ambos os caminhos
fossem executados na ordem contrária.

## Correções desta etapa
1. Candidato conjunto: código da V332 + V333 e ambas as suítes de regressão no `npm run check`.
2. `pwa.js` passa a inserir os novos links na navegação Premium **real** se estiver disponível,
   com fallback para o menu V332 legado sem apagar URLs.
3. `scout-ui-v189.js` evita copiar o link redundante de técnicos porque a
   entrada Premium V326 já o apresenta.
4. QA Chromium V326 confirma um único link de técnicos, acesso à adição de cartas
   pessoais e manutenção de ferramenta legada na navegação Premium.
5. Service Worker atualiza o cache para V334 e inclui `pwa.js`, garantindo os
   atalhos durante uso PWA offline.
6. Teste `scripts/test-integration-v334.cjs` audita os dois fluxos e preserva 246 cartas.

## Salvaguardas
- Não tocar PP, níveis, Card IDs, habilidades, ímpetos, builds ou fichas homologadas.
- Minhas Cartas e Outros Elencos preservam isolamento.
- O atualizador Windows continua exigindo consentimento e não instala
  automaticamente após a opção **Depois**.
- Android continua offline pelo bundle Capacitor; o Service Worker é apenas para PWA.

## Portões para aprovação
Exigir CI `npm run check`, auditoria 246 cartas, QA Chromium Android/Windows,
compilações de teste, teste manual no Windows com uma versão anterior e revisão
do mantenedor. Antes do merge reconciliar os PRs #245 e #246 para não duplicar
alterações. **Esta etapa não cria APK/EXE oficial nem publica release.**

## Limitações explícitas
- Testes de GitHub Actions não provam instalação em computador físico.
- Dados locais Android e Windows não são sincronizados automaticamente pela atualização.
- Os menus Premium e o atualizador não validam competitivamente as fichas individuais.

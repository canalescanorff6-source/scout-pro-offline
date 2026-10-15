# SCOUT PRO V188 — Correção da ficha após vídeo real de 15/10/2026

## Evidência do vídeo
O usuário enviou um vídeo de cerca de 104 segundos (480×1068, 31 fps) mostrando o aplicativo Android V187. A carta demonstrada é **#001 Daniele Massaro**. A interface começava com um quadro abstrato «Minha ficha principal · Posse de Bola» e informações de ímpetos/habilidades reapareciam em módulos V162, V74, V68, V98 e laboratório. A arte e o nome só apareciam após longa navegação. Havia referências ao segundo «SLOT SELECIONÁVEL +1» apesar de **o print da carta mostrar «Fisicalidade +3» e «Instinto artilheiro +1»**.

## Origem e tratamento correto dos boosters
O arquivo `Screenshots.rar` contém 241 imagens JPEG eFHUB. Todas têm **dois campos visíveis na faixa de ímpetos**. Foi feita leitura por recorte padronizado das duas caixas e transcrição automática, com checagens contra as 15 observações V184 antes publicadas e inspeção visual amostral dos casos especiais. O arquivo `web/SCOUT_V188_EFHUB_BOOSTERS_241.json` contém **241 pares (482 campos)**, nome do arquivo e SHA256, candidatos de associação e estado de revisão.

* **Massaro #001:** `Fisicalidade +3` + `Instinto artilheiro +1`.
* **Oblak Show Time #170:** `Goleiro +3` + `Goleiro +1`.
* **Cristiano Ronaldo** (uma das edições): `Instinto artilheiro +4` + `Fisicalidade +3`.
* **103 pares** têm `Sem Impulso` nas duas caixas do print; **isso não autoriza afirmar que não existe slot na conta**.

**Limite:** o texto do eFHUB mostra estado da simulação. Não prova bônus aplicados no jogo, nem identidade por Card ID, nem disponibilidade de slot. A extração automática dos demais valores além dos 15 confrontados deve ser revisada por edição antes de migrar para dados canônicos. Prints com jogadores repetidos exigem seleção de versão; o usuário não precisa cadastrar manualmente um ímpeto para ver a sugestão.

## Layout único implementado
O `web/scout-profile-v188.js` substitui **o painel V187**, sem remover seus arquivos ou qualquer dado. A ficha fica na mesma ordem para as **246 cartas**:

1. Imagem original, raridade, nome, Card ID e função.
2. Treino do Scout PRO: PP e distribuição por categoria do cenário registrado (não valores vindos do eFHUB).
3. Duas caixas: **Ímpeto 1 do print / Ímpeto 2 do print** com fonte explícita.
4. **Melhor complemento sugerido para Posse** usando o motor V162/V103 que já ranqueia os boosters craftáveis; *não depende do preenchimento prévio de slot*.
5. Campo opcional «Nesta carta não dá para alterar o segundo ímpeto», salvo localmente **por CAP + Card ID**, sem mudar a sugestão teórica.
6. Modelo corporal / pé fraco **somente onde há medida transcrita e vínculo único** (15 existentes; 226 sem transcrição física completa permanecem identificadas como tal).
7. Cinco habilidades adicionais em destaque no V162, com bloqueio de duplicatas existentes.
8. «Mostrar análises avançadas» para relatórios V68/V74/V98, laboratório e outras bases. Conteúdo preservado, porém recolhido inicialmente no mobile.

### Separação crítica
A recomendação de ímpeto é uma **hipótese por posição, estilo e tática**; «já equipado na conta» é outra coisa. A marcação de que o slot não é alterável impede tratá-lo como equipável, mas ainda mostra o melhor nome para comparar. Nunca dar a entender que foi instalado automaticamente. Nenhum nível, PP, treino, ID ou PNG foi modificado.

## Fluxo de atualização
- `web/app-bridge.js` não carrega mais o painel V187, apenas o novo V188.
- O motor V162 avisa quando carregou por evento `scoutpro:recommendations-ready`, para não deixar o quadro preso em «calculando» caso os módulos carreguem em ordens diferentes.
- `web/sw.js` inclui script, CSS e base eFHUB no cache PWA para Android/Windows offline.
- `scripts/test-video-review-v188.cjs` cobre 241 imagens, 482 campos, 15 conferências antigas, Massaro, Oblak, Ronaldo, 246 recomendações, mapa de PP, layout e cache.
- Os testes antigos V187 foram atualizados para reconhecer o novo layout, sem abandonar seus testes de habilidades e integridade.

**Verificação obrigatória:** antes de publicar, manter auditoria, Android e Windows GREEN. A CI não substitui homologação visual no celular físico, principalmente porque o vídeo revela falhas de usabilidade que a CI antiga não capturava.

## Próxima etapa de dados corporais
As 241 imagens também contêm tamanho da perna, braço, ombro, pescoço, cintura, coxa, panturrilha e escala de cobertura. Apenas 15 modelos físicos foram aprofundados na V184. Completar os outros 226 requer nova transcrição, revisão de identidade da edição e prova de fonte; não deduzir *Player ID oculto* ou velocidade de animação de números estáticos.

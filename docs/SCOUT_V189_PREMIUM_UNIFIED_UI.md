# Scout PRO V189 — Interface Elite unificada Android + Windows

## Objetivo
Simplificar o catálogo e ficha no celular com aparência premium sem reduzir a experiência desktop e **sem remover nenhum recurso existente**. Mesma base `web/` é empacotada pelo Electron e Capacitor.

## Catálogo
No Android e telas estreitas (até 720 px), topo exibe foco Posse central e quatro acessos principais: Meu elenco, Minhas formações, Ímpetos e habilidades, Biotipo. Vídeos, auditorias e formações experimentais ficam no menu `Mais ferramentas e análises` — os links originais permanecem acessíveis. A metodologia detalhada abre por `Como funciona a análise`. O desktop mantém a home original rica em dados. Grade, filtros de posição/raridade/estilo, pesquisa, 246 cartões com artes originais e navegação permanecem intactos.

## Ficha
Módulo V188 continua como ficha principal (treino/PP, 2 ímpetos da fonte e recomendação, 5 habilidades, detalhe opcional). V189 aplica acabamento responsivo e **amplia biotipo sem fingir Player ID oculto**:
- `SCOUT_V101_MODELO_CORPORAL.json`: 15 perfis externos associados a Card ID numérico e edição.
- `SCOUT_V184_EFHUB_241_COMPLETE.json`: 15 observações físicas aprofundadas de prints, mostradas somente por candidato único, sem homologar automaticamente Card ID.
- `SCOUT_V189_CORPO_EXTRAS.json`: parâmetros de Massaro #001 transcritos do print real: braço 8, ombros largura 8, pescoço comprimento 7, peito 7, pescoço tamanho 9, ombro altura 6, perna comprimento 11, coxa 9, cintura 8, braço tamanho 9, panturrilha 9; cobertura pernas 174,9, braços 163,7, salto 265,4, colisão 50,3 e base de pé 183. Fonte é tela do eFHUB, **não** prova de animação ou Player ID. Restantes aguardam transcrição do próprio print; nunca preencher com medidas de outra carta.

## Paridade Android e Windows
A diferença de versão instalada explica por que o usuário pode ver uma mudança no Android antes de vê-la no Windows: ambos são gerados do **mesmo código**, mas cada instalador é atualizado separadamente; dados alterados apenas no armazenamento local também **não se sincronizam automaticamente**.

A V189 adiciona `scripts/stamp-bundle-v189.cjs`, que grava `web/scout-build-info.json` com número da release, Git SHA e fingerprint determinístico de 16 fontes web essenciais. Workflow oficial **carimba o mesmo conjunto em Windows e Android** após definir número de versão e normalizar estilos, inclui manifestos nos artefatos e compara os dois arquivos com `cmp` **antes de publicar**. Divergência cancela a publicação. Versão / revisão ficam consultáveis no menu Mais, inclusive no Android; update Windows e APK permanecem funcionais.

## Proteções
246 cartas, raridades, níveis, PP, treinamentos originais, Card IDs, histórico, cinco habilidades e slots continuam intactos. Efeitos animados também preservados. No celular, dock fica menor e os controles Topo/Meus dados continuam dentro do menu `Mais`. CSS de desktop preservado.

## Limites / homologação
Testes de estrutura e fingerprint são obrigatórios, junto a CI Windows + Android. A validação visual **no dispositivo físico** ainda será necessária. Não há sincronização em nuvem dos ajustes pessoais; para levá-los ao outro dispositivo, usa-se backup/exportação existente. Nem o eFHUB nem as medidas fornecem acesso confirmado ao Player ID interno do motor de jogo.

# V307 — Central de Técnicos integrada (Android + Windows)

## Razão da mudança
A V306 já entregou 22 versões em destaque, mas só dentro dos seletores nas fichas. O usuário pediu implementação real e acesso a **todos os dados** dos técnicos no aplicativo, não um prompt. A V307 cria uma central própria na base existente, preservando as 246 cartas, suas builds e Outros Elencos.

## Entregue em código
- `web/tecnicos-v307.html`: tela independente acessível da home e de Outros Elencos.
- `web/craque-manager-hub-v307.js`: navegação sobre os **70 registros V302**, 22 em destaque, busca por nome/versão, filtros por estilo, proficiência e dupla competência 85+, favoritos, marcação "meu técnico", comparação de dois técnicos, e escolha de técnico padrão para Minhas Cartas.
- `web/craque-managers-v307.css`: layout original mobile e desktop.
- **Seis proficiências em tela** com graus visuais separados (90, 89, 85–88, abaixo de 85).
- **Metadados documentais V302**: edição, bônus, Link-Up Play e requisitos de ativação quando documentados, fonte da versão e status.
- Retratos adicionados **exclusivamente pelo usuário**, em JPEG thumbnail local para a edição correta (sem hotlink ou distribuição não licenciada). Os dados ficam sob `scoutpro:v307:manager-portrait:<catalog_id>`, integráveis ao backup local existente. Não prometer sincronização automática entre dispositivos.
- `craque-managers-v302.js`: retrato autorizado e as seis proficiências visíveis na ficha original; link para a Central.
- `craque-friends-training-ui-v228.js`: mesmas seis proficiências e retrato por versão em Outros Elencos. Configurações de técnico por carta e proprietário existentes V306 intactas.
- PWA offline e fingerprint Android/Windows atualizados.
- QA de dados Node `test-manager-hub-v307.cjs` e QA Chromium `qa-managers-v307.py` integrados ao CI.

## Limites que continuam explícitos
1. O catálogo V302 de 70 versões tem identificadores `CT-MGR` **internos**; não afirmar correspondência com IDs oficiais ou posse na conta.
2. A shortlist de 22 é seleção editorial do usuário, não ranking estatístico de popularidade.
3. Overload/Sobreposição: proficiência disponível, **motor PP não homologado**. Não produzir build simulada de outro estilo sob este nome.
4. Bônus e combinações apenas documentais. Não calcular atributo final sem dados-base da carta/edição, nem somar a PP.
5. Retratos originais de terceiros não são redistribuídos sem autorização. Fotos individuais fornecidas pelo usuário não se tornam licença para redistribuição.
6. Nenhuma carta original, build aprovada ou ímpeto equipado é reescrito.
7. Favoritos e padrões são preferências locais. Exportação/backup do usuário precisa ser validada em dispositivos físicos.

## Gates antes de publicação
- CI completo incluindo V302, V303, V305, V306 e V307.
- QA visual mobile e Windows incluindo a Central.
- Smoke Android debug e Windows EXE.
- Merge aprovado e geração coordenada de release com assinatura persistente Android e metadados Windows válidos.
- Nunca marcar teste físico de atualização como aprovado sem executar no dispositivo real.

## Edições prioritárias
Conservar a seleção e IDs internos exatos da V306 em `docs/SCOUT_V306_TECNICOS_COMPETITIVOS.md`; nenhum duplicado foi criado.

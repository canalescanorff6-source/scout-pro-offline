# Craque Tático V328 — Premium, fase 3 · Técnicos sem excesso de informação

**Base verificável:** `main` / release oficial `v1.1.910` (V327).  
**Escopo compartilhado:** Minhas Cartas, Outros Elencos, Central de Técnicos, Android e Windows.

## Auditoria — achados reais

1. **Alta — seis barras por técnico, abertas continuamente.** O catálogo de 23 destaques exibia 138 barras, além dos botões e detalhes de cada edição. A pessoa precisava procurar o estilo relevante no meio de outros cinco. Corrigido para **uma proficiência em foco**, por padrão Posse, ou estilo do filtro ativo. Os seis estilos continuam disponíveis em “Ver as 6 proficiências”.
2. **Alta — atalhos de favoritos e técnicos próprios escondidos no seletor de catálogo.** A Central já salvava favoritos e marcação de posse local, mas exigia abrir um seletor. Agora quatro filtros rápidos acionam o mesmo modelo persistente: Destaques, Meus técnicos, Favoritos, Todas as versões. Sem novas bases redundantes.
3. **Média — versões da mesma pessoa difíceis de distinguir.** Duas versões de Klopp ocupavam resultados separados, mas não havia acesso direto à lista de suas edições. O novo botão “Ver N versões” limpa filtros incompatíveis, pesquisa o nome e mostra as versões reais do catálogo, sem fundi-las nem inventar nomes/IDs.
4. **Alta — escolha de técnico em Minhas Cartas era uma lista de 71 edições sem busca.** Adicionada pesquisa local por nome, edição ou CT-MGR. A edição ativa é preservada mesmo que o texto pesquisado mude. O campo de seleção V302, as preferências locais existentes e os 22 destaques+Kovač permanecem.
5. **Alta — mesmo problema em Outros Elencos.** Pesquisa independente na ficha da pessoa, com seleção e dados isolados. A pesquisa em si não grava preferência nem troca treinador.
6. **Média — acúmulo de informações no modal de Outros Elencos.** Proficiência do estilo selecionado sempre à vista; demais cinco estilos, bônus, afinidade e combinações aparecem sob demanda. Não inventar bônus, nem aplicar pontuação de técnico como PP.

## Novo comportamento mensurável

- Central: primeiro cartão, **Kovač Posse 90**, aparece com nome, edição e proficiência principal. As demais cinco proficiências ficam sob `details` acessível.
- Busca por “Klopp” mostra as duas edições, conservando dois `catalog_id` diferentes. Buscar “Kovač” sem acento também funciona.
- “Favoritos” é um atalho, mas seus registros antigos `scoutpro:v307:manager-favorites` continuam válidos.
- Em Minhas Cartas e Outros Elencos, pesquisar outro treinador **não aplica automaticamente** o técnico pesquisado. A seleção atual permanece; só a escolha explícita no `select` altera a configuração.
- Todas as 71 versões, seis proficiências por técnico e 246 cartas pessoais permanecem no acervo e offline.
- Não há modificação em builds, PP, habilidades adicionais, ímpetos fixos, Card IDs ou fonte documental.

## Provas e CI

- `node scripts/test-premium-managers-v328.cjs`, incluído em `npm run check`: integridade do catálogo (70 originais + Kovač), 23 destaques, 2 Klopp, Kovač Posse 90, favoritos, fontes, tratamento de edições e paridade de bundle.
- `python scripts/qa-premium-managers-v328.py`: Chromium Android 390×844 e Windows 1366×768; 23/71, cartões recolhidos, favoritos, filtros, busca Klopp, seis notas restauráveis; escolha por edição dentro de uma carta de Outros Elencos e uma de Minhas Cartas; verifica pesquisa sem troca silenciosa e ausência de overflow.
- `scripts/qa-managers-v307.py` e demais regressões V327/V326/V325/V311 permanecem executados.
- Service Worker recebe chave V328 para impedir cache visual misturado; fingerprint de ambos os instaladores já inclui os JS/CSS/HTML compartilhados.

## Escopo concluído versus próximos passos

**V328:** engenharia do seletor de técnicos e hierarquia informacional, sem reclassificar tecnicamente nenhum treinador.  
**V329 (proposta seguinte):** simplificar a tela de escalação e o laboratório mantendo papel de cada reserva e instruções.  
**Pendente de fonte:** comprovação de ativação de Link-Up, efeitos exatos de bônus/Overload e propriedade real de cada edição. Não inventar esses dados.

**Gate de entrega:** PR e testes, CI, QA de oito viewports, builds Android e Windows; publicação conjunta apenas após todos estarem verdes. Testes automatizados em Chromium não equivalem a teste físico no aparelho do usuário.

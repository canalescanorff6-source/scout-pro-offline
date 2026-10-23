# Craque Tático V328 — Fase 3 Premium: seleção de técnicos mais simples

## Origem da melhoria
O proprietário pediu um aplicativo premium, menos confuso, especialmente na escolha de fichas, estilos e técnicos. A Central V307 já tinha favoritos e pesquisa, mas o seletor individual de Outros Elencos despejava dezenas de opções num único campo, em grupos históricos, sem busca direta, sem filtro e sem acesso rápido a favoritos. Filtrar a lista sem preservar a seleção atual poderia alterar indevidamente a ficha.

## Alterações implementadas
- **Busca offline acessível:** por nome, edição, ano ou CT-MGR, normalizada para acentos/caixa; a busca jamais consulta servidores.
- **Tela reduzida por padrão:** primeiro os 23 destaques (22 competitivos históricos + Niko Kovač); a lista total de versões fica em "Todas as versões".
- **Filtros:** Destaques, Favoritos, Meus técnicos, Todas as versões. A versão atualmente selecionada fica visível mesmo que não passe no filtro; não ocorre reset silencioso.
- **Favoritos compartilhados:** reaproveita `scoutpro:v307:manager-favorites` da Central de Técnicos, sem migrar, reescrever nem alterar favoritos existentes.
- **Priorização:** técnico escolhido, depois favorito, pertencente ao usuário e por proficiência registrada para o estilo; não cria proficiências, novas versões ou bônus fictícios.
- **Interface:** busca com teclado, alvos de 44px, contagem de resultados, botão de favorito com `aria-pressed`, estilos e CSS responsivos Android/Windows.
- **Seleção individual:** preserva `scoutpro:v306:manager:<proprietário>:<carta>` e a escolha de tática anterior; mudar filtro não salva PP, habilidades ou ímpetos.
- **Empacotamento:** motor compartilhado `web/craque-manager-selector-v328.js`, cache offline invalidado, `scripts/stamp-bundle-v189.cjs` atualizado para os dois sistemas.

## Auditoria e critérios de aceitação
1. Os dados das 246 cartas pessoais e dos acervos externos não foram reescritos.
2. Favoritar e pesquisar técnicos deve preservar o técnico vinculado e suas fichas de MAT/SA.
3. Um treinador de outra edição não é considerado o mesmo técnico só porque compartilha nome.
4. O teste legado V306 mantém as 22 edições originais, agora com filtragem dinâmica.
5. Novo teste `scripts/test-manager-selector-v328.cjs` valida busca, abreviações, perfis, favoritos, filtros e proteção de seleção.
6. Novo teste de interface `scripts/qa-manager-selector-v328.py` percorre seleção real em resolução Android e Windows, acentuação, favorito, troca de carta, persistência do ID individual e ausência de falhas.
7. CI, QA visual e ambas as compilações de teste devem passar antes de integrar; APK assinado e instalador Windows devem ser verificados na release pública antes de declarar publicação.

## Limites / oportunidades futuras
- A Central V307 já possui busca/favoritos, mas exibe seis proficiências por cartão; próximo ciclo: apenas o estilo relevante em destaque, demais cinco recolhidos, mantendo documentação acessível.
- A ficha pessoal de Minhas Cartas mantém controle V302 existente; futura modernização pode reutilizar o mesmo motor V328, sem introduzir mudança arriscada de origem/técnico.
- Favoritos são salvos localmente e só migram entre instalações se exportados/importados pelo backup. Não há sincronização automática Android↔Windows.
- Proficiência documentada não implica bônus automaticamente aplicado a PP. A qualidade de uma ficha permanece dependente de evidências por edição.
- O uso da interface foi verificado por Chromium automatizado; ainda requer avaliação física de usabilidade pelo proprietário.

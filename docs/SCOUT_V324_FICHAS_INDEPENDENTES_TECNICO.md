# V324 — fichas independentes por técnico, edição, posição, estilo e acervo

## Falha anterior comprovada
O editor `scout-training-unified-v218.js` salvava o rascunho de PP por `Card ID + arquivo + estilo`. Dois técnicos de Posse usavam a mesma chave; escolher SA vs CA também não isolava essa edição no editor. Em contrapartida, o motor V311 já separava os cenários consultivos por `acervo + proprietário + carta + edição + posição + estilo + técnico` e os preservava com revisões.

## Implementação V324
1. `craque-manager-fichas-v324.js` estabelece um perfil contextual com identidade rigorosa: `coleção + proprietário + CAP/identificador local + Card ID + edição + ID interno da edição do técnico + posição de uso + estilo coletivo + assinatura documental`.
2. O motor tem armazenamento local offline com prefixo **`scoutpro:v324:manager-profile:`** (elegível ao backup que preserva chaves `scoutpro:`), leitura e gravação com validação de custo progressivo real de PP, dez categorias (0–20), até cinco habilidades **candidatas** sem duplicação e um ímpeto **candidato**.
3. Cada salvamento gera revisão sequencial; não grava atributos finais, skills equipadas, slots presumidos, ímpetos fixos ou builds aprovadas. Histórico corrompido é bloqueado e **não sobrescrito**. Quando mudam os dados documentais de uma carta, a assinatura gera outra chave; histórico anterior permanece recuperável.
4. O painel posicional V311, usado **em Minhas Cartas e Outros Elencos**, agora apresenta seção "Minha ficha neste técnico". Ela mostra PP contextual, permite selecionar candidatos de habilidades e ímpeto, salvar rascunho próprio e recuperá-lo por técnico/posição/estilo.
5. O editor de PP do topo (Minhas Cartas) usa a identidade emitida pela ficha V311. Seus ajustes são persistidos **somente no técnico/posição/estilo ativo**, sem escrever na chave legada compartilhada. Desabilita realimentação de um rascunho contextual ao laboratório legado que não conhece o técnico.
6. Se não há técnico válido, motor posicional ou edição documentada, o editor conserva o comportamento legado; **não migra automaticamente** os rascunhos antigos para o novo treinador.
7. Niko Kovač CT-MGR-071 (PR #233) e R. Rodríguez CT-MGR-004 podem manter fichas distintas mesmo em Posse de Bola. Mudar SA↔CA, técnico, estilo, edição ou proprietário não mistura treinamento nem equipamento proposto.
8. Estilos sem motor homologado (Sobreposição) continuam sem ficha PP calculada. Treinos de posição sem familiaridade documentada são identificados como simulações, não autorização de uso.

## Limites de precisão
- A interface não cria magicamente builds individuais competitivas validadas das 246 cartas para todos os treinadores. Ela permite registrar/contextualizar **uma ficha distinta sob demanda para cada carta e treinador**, preservando as 246 identidades reais, seus PP e evidências. Só se classificam propostas como homologadas após dados-base, habilidades, slots e validação competitiva.
- O bônus do técnico não vira PP. A edição de Neymar CA/SA não é automaticamente validada para SA.
- A seleção de 5 habilidades candidatas não demonstra 5 slots livres, nem equipa nada no eFootball. O campo de ímpeto é consultivo.
- Os dados ficam localmente em cada instalação. Android e Windows recebem o mesmo código após release; preferências editadas num aparelho só vão ao outro por backup/importação, não por sincronização automática.

## QA obrigatório
- `node scripts/test-manager-fichas-v324.cjs` — isolamento por técnico, edição, posição, estilo, proprietário, revisão, custo PP, corrupção e 246 cartas.
- `npm run check` completo e QA visual Android/Windows de ambos os acervos.
- Verificar V218, V301, V311, V314, V323 e backups regressivamente.
- Builds Android/Windows e publicação somente depois da CI, integridade e revisão autorizada.
- Nenhum teste físico foi executado nesta etapa.

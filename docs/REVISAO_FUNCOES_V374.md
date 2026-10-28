# V374 — revisão individual por função

A mesma revisão agora aparece nas 246 fichas originais e na aba de treinamento das 15 cartas adicionadas. A posição de uso e a tática selecionadas determinam as prioridades, a proposta de PP e as candidatas de habilidades/ímpetos pelos motores V251/V233/V162/V103 existentes.

O painel **Plano por função** mostra a posição original e a escolhida, o estilo individual, os grupos de atributos relevantes, o treino atual comparado à proposta, o custo real da troca em PP, a lista nativa, os motivos das habilidades complementares e observações práticas para partidas. Valores parciais cadastrados não recebem selo de atributos finais validados. Gastar PP livres é apresentado separadamente de redistribuir PP.

## Comportamento de dados

- Abrir, trocar posição ou trocar tática só calcula uma prévia. Nenhuma carta, imagem, identidade, PP de origem ou equipamento é regravado.
- **Adotar proposta em nova revisão** exige clique explícito. Nas fichas originais utiliza o histórico contextual V324, preservando as habilidades/ímpeto já selecionados, ou o histórico V311 quando não há técnico selecionado. Não substitui os dados legados da carta nem equipa nada no jogo.
- As 15 adições usam rascunhos isolados `scoutpro:v374:function-draft:*`, por carta local, Card ID/edição cadastrados, posição, tática e técnico. Cada adoção guarda a revisão anterior. Alterar a fonte marca o rascunho anterior como desatualizado; dados ilegíveis bloqueiam nova gravação e são preservados. Essas chaves já participam do backup `scoutpro:*`.
- O limite de 40 revisões bloqueia o próximo salvamento; não descarta silenciosamente a revisão mais antiga.
- O nível mostrado no simulador eFHub não se torna nível máximo. Sem PP ou nível máximo declarados, a revisão apresenta prioridades, nativas e hipóteses funcionais, mas não inventa uma distribuição.
- A ficha original passa a consultar as anotações e os recibos de equipamento já existentes. Nomes adicionais informados deixam de ser novas candidatas; só o recibo completo da edição/lista atual comprova vagas livres. Um recibo de outra edição não é herdado. O slot/ímpeto confirmado usa a mesma prova V283 existente.
- Posição original, familiaridade comprovada, treinamento confirmado e prévia condicional permanecem distintos. Neymar #090, MLE, pode ser analisado como SA; Maldini #010, LD, pode ser analisado como ZG. A prévia não autentica essas posições.

## Seleção automática dos elencos

O motor V230 anteriormente permitia pontuação positiva para posições próximas sem prova, e `rank` mantinha essas cartas. O gerador V219 usava a mesma condição permissiva. Agora a recomendação/seleção automática exige posição original ou familiaridade/treino confirmados na edição exata. Os comparadores continuam permitindo consultar adaptações condicionais.

Quando não existe carta comprovada suficiente, o contexto conserva a vaga e apresenta o aviso de equipe incompleta. Isso preserva as restrições, a identidade de pessoa, as rodadas independentes, os históricos anteriores e a contagem de todas as cartas disponíveis. Não preencher uma vaga com adaptação não comprovada passa a ser a regra deliberada dos testes antigos V219/V222.

Os cinco perfis matemáticos existentes permanecem independentes. **Sobreposição está explicitamente pendente no laboratório**: não foi derivado um perfil numérico sem fonte, nem convertido silenciosamente em Posse de Bola. A interface informa essa limitação e a API rejeita o estilo ainda não implementado com mensagem específica.

## Validação

Os novos testes foram escritos e observados falhando antes das respectivas correções:

- `node scripts/test-role-planner-v374.cjs`: rejeição de adaptações não comprovadas no ranking/gerador, confirmação de familiaridade por edição, vagas reais e preservação dos dados.
- `node scripts/test-function-review-v374.cjs`: Neymar #090 MLE→SA e Maldini #010 LD→ZG nos cinco estilos; recibos de equipamento; PP livres versus redistribuídos; revisão explícita, corrupção e desatualização; varredura das **261 × 5 = 1.305 revisões**. São 1.230 propostas dos originais com PP exatos e 75 cenários das adições com PP pendentes.
- Regressões relacionadas: V219, V222, V230, V245, V246, V260, V311, V324, V359 e V364. O teste V374 também executa o renderizador HTML real do rodízio com um elenco incompleto e exige a vaga SA visível e a contagem 10/11.

A inspeção visual manual da nova interface no computador do usuário não foi executada: Computer Use foi interrompido com Escape e permaneceu parado. Os testes visuais automatizados do CI são registrados separadamente no PR. Não houve publicação do app, instalação ou modificação de configurações do computador.

Para essa revisão visual posterior: abrir Neymar #090, selecionar SA, comparar os grupos de PP e o indicador de familiaridade; repetir em Maldini #010 como ZG e em uma das 15 adições sem nível máximo. Confirmar que a distribuição permanece pendente nessa adição e que nenhum rascunho é salvo só ao abrir ou trocar o contexto.

## Arquivos desta implementação

```text
web/craque-friends-training-v228.js
web/craque-positional-v311.js
web/craque-positional-ui-v311.js
web/craque-positional-v311.css
web/craque-tactics-v230.js
web/scout-rotation-engine-v219.js
web/scout-rotation-lab-v219.js
web/ct364-owned-main.js
scripts/test-function-review-v374.cjs
scripts/test-role-planner-v374.cjs
scripts/test-rotation-lab-v219.cjs
scripts/test-rotation-restrictions-v222.cjs
scripts/test-unique-person-v245.cjs
docs/REVISAO_FUNCOES_V374.md
```

Os motores não regravam o catálogo, fichas originais, JSON de cartas ou imagens. Na integração, `package.json` inclui os dois testes V374; o índice distingue base parcial e o botão aponta para o catálogo de 200 planos. O pipeline obrigatório gera normalizações HTML e informações de build, que permanecem fora do commit de código e serão reproduzidas pelo CI. Nenhuma publicação do app foi feita.

## Limites e decisões de integração

A referência de Rentão foi conferida em transcrição automática de um vídeo original, não como build numérica para estas edições. O perfil de Blackjhon exige login. Não há evidência para afirmar que todas as cartas atingiram o melhor desempenho possível. Os testes provam cálculo, histórico e isolamento; não medem melhora em partidas online.

## Catálogo em 320px

A normalização dos rótulos passou a permitir que position-order criasse a instrução de ordenação. O V203 movia os controles para os filtros recolhidos, mas deixava essa instrução acima deles, ocupando cerca de61px. Agora move o mesmo nó junto da posição; mantém os eventos e a ordenação atual. O teste V203 foi reproduzido falhando e aprovado após a correção, sem alterar offsets CSS ou o limite de QA.

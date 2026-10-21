# V295 — Confiança documental exibida no parecer da ficha

Base: PR #202 (V294). A função `methodologyGate` omitia `max_level` e `pp_origem` ao criar o perfil para o cálculo de ímpetos, embora o motor V292 use esses dados para distinguir confiança baixa por ausência documental da confiança limitada. A mesma interface omitira `estado_confianca` do parecer que o usuário vê.

Correção:
- Propagar `max_level` e `pp_origem` sem inventar valores e sem tocar no catálogo;
- Preservar `documentaryConfidence` e `confidenceReason` no retorno do parecer;
- Mostrar na ficha o estado de confiança do ímpeto, sem alegação de meta ou resultado de partidas;
- Teste de 246 cartas × cinco estilos, incluindo CAP191 Martinelli (26 níveis, 50 PP);
- Atualizar cache offline e incluir o teste em `npm run check`.

Não equipar nem gastar tokens. Sem merge, publicação, nem alteração nas 246 cartas originais.
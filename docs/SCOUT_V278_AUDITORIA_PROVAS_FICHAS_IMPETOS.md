# V278 — Auditoria de evidência real nas 246 cartas

## Continuação
**Projeto existente** Craque Tático — Laboratório de Futebol (`canalescanorff6-source/scout-pro-offline`). Origem V277, merge `ed6fe0287699c102643205a8f1a9bf81ec4b4ab2`, release `v1.1.661`.

## Correções estruturais e melhorias
1. **Vincular as cinco habilidades adicionais à edição completa** (versão e Card ID), não apenas ao número da carta.
2. **Exigir assinatura das habilidades nativas** na prova de adicionais: se uma nativa mudar, a confirmação antiga deixa de liberar vagas.
3. **Manter registros antigos**, porém classificá-los como não verificados até conferência humana na edição presente; não deletar saves.
4. **Recusar provas de outra edição**, ainda que o nome e os cinco slots coincidam.
5. **Recusar prova de outra CAP**, mesmo que o Card ID seja coincidente.
6. **Recusar prova de outra identidade** e número de carta.
7. **Bloquear duplicatas** (PT-BR vs EN da mesma skill) quando importadas como duas adicionais.
8. **Bloquear mais de cinco adicionais** no verificador central — não depender apenas da UI.
9. **Recusar skills não mapeadas** nos cinco slots de adicionais, sem apagar os registros originais.
10. **Recusar como adicional a mesma habilidade nativa** da edição.
11. **Rejeitar confirmação revogada** ou com assinatura divergente da lista de habilidades.
12. **Permitir confirmação explícita de zero adicionais** somente com evidência adequada; zero preenchido não é cinco slots comprovados.
13. **Proteção do segundo ímpeto por edição**: registro local precisa ter versão, Card ID e estado físico válido.
14. **Rejeitar a confirmação legada do segundo slot** como autorização de gasto; os dados permanecem para revisão.
15. **Rejeitar o slot pertencente a outra edição**, mesmo que o número da carta seja igual.
16. **Rejeitar estados desconhecidos do segundo ímpeto** (`indefinido` não equivale a `vazio`).
17. **Explicação na própria ficha** quando for detectada conferência do ímpeto antiga e sem vínculo.
18. **Nova agenda por carta:** primeiro identidade, posição, nativas, PP, adicionais, segundo ímpeto, atributos-base.
19. **Agenda prioriza o que verificar**, nunca “corrige” o jogador inventando PP ou habilidades.
20. **Mostrar primeiro item pendente** e passos seguintes dentro do laudo existente sem criar uma segunda ficha concorrente.
21. **Rastreamento independente de vídeo:** URL opcional é apenas candidata; não prova autoria nem treino competitivo.
22. **Status de vídeo pendente** quando nenhuma fonte específica foi cadastrada.
23. **Nunca homologar autoria de Rentão/Blackjhon** com base apenas em URL ou rótulo de edição.
24. **Distinguir completude documental de qualidade competitiva**, ainda que os sete campos estejam preenchidos.
25. **Sem aplicação automática** de habilidades ou ímpetos e sem alteração de builds aprovadas.
26. **Testar 246 × 5 = 1.230 situações**, incluindo nativas desconhecidas, PP ausente e posição doutrinada.
27. **Regressões anti-stale**: edição errada, nativa alterada, idioma duplicado, quantidade maior que cinco, slots e provas legadas.
28. **Dossiê JSON por Card ID e tática**, para revisão prioritária das 246 cartas.
29. **Atualização segura do cache offline** Android e Windows com o mesmo conteúdo.
30. **Gate de publicação**: testes completos + auditoria 246 cartas + Android e Windows + oito resoluções visuais antes do PR; depois checks da main e instaladores oficiais assinados.

## Limites
A ficha é uma análise técnica **heurística, não uma build autenticada de Rentão/Blackjhon**. A confirmação da mesma versão exige evidência original (print/vídeo da carta e evolução). Se uma prova legada deixar de ser suficiente, o registro não será apagado e o usuário poderá revisá-lo no app.

## Verificação automatizada
`node scripts/test-proof-readiness-v278.cjs`

Arquivo de auditoria: `build/v278-evidence-readiness-246x5.json`, anexado ao fluxo de CI. Não atribuir resultado de partidas, tiers competitivos ou Overall a informações apenas documentais.

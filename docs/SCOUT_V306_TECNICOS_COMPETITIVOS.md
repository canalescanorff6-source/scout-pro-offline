# V306 — 22 versões competitivas de técnicos, sem duplicação de catálogo

## Baseline verificada (21/10/2026)
- Projeto existente: `canalescanorff6-source/scout-pro-offline`.
- `main` anterior ao lote: `c94117bed80e1a6b5029086cd3819628e447f710` (V305).
- Release observada: `v1.1.787`.
- O catálogo V302 já contém 70 registros e **as 22 versões selecionadas abaixo**. A V306 as destaca, **não cadastra registros duplicados**.
- IDs `CT-MGR-xxx` são internos, não IDs oficiais Konami. Os dados vêm do catálogo recebido e seguem documentais até prova da edição/uso na conta.

## Seleção explícita do proprietário
| ID interno | Versão | Proficiências prioritárias |
|---|---|---|
| CT-MGR-013 | Thomas Tuchel, 2026-06-04 | Posse 90; Rápido 89 |
| CT-MGR-008 | D. Deschamps, 2026-06-11 | Posse 89; Normal 89 |
| CT-MGR-017 | Jürgen Klopp, 2026-02-05 | Posse 89; Rápido 89 |
| CT-MGR-001 | Jürgen Klopp, 2026-10-15 | Rápido 90 |
| CT-MGR-014 | Johan Cruyff, 2026-04-23 | Posse 89; Por Fora 89 |
| CT-MGR-020 | Mikel Arteta, 2025-12-18 | Posse 89; Normal 88 |
| CT-MGR-027 | Hansi Flick, 2025-09-18 | Posse 89; Rápido 88 |
| CT-MGR-023 | Pep Guardiola, 2025-11 | Posse 89; Por Fora 89 |
| CT-MGR-025 | Cesc Fàbregas, 2025-10-09 | Posse 89 |
| CT-MGR-006 | Antonio Conte, 2026-08-13 | Rápido 90; Por Fora 89 |
| CT-MGR-012 | R. Martínez, 2026-06-04 | Rápido 90; Passe Longo 89 |
| CT-MGR-019 | Xabi Alonso, 2026-01-08 | Rápido 89; Por Fora 89 |
| CT-MGR-011 | V. Montella, 2026-06-11 | Rápido 89; Por Fora 89 |
| CT-MGR-005 | José Mourinho, 2026-09-10 | Normal 90 |
| CT-MGR-028 | Fabio Capello, 2025-09-04 | Normal 89; Passe Longo 89 |
| CT-MGR-009 | J. Nagelsmann, 2026-06-11 | Normal 89; Passe Longo 89 |
| CT-MGR-015 | F. Beckenbauer, 2026-03-12 | Normal 89; Passe Longo 89 |
| CT-MGR-010 | Ronald Koeman, 2026-06-11 | Normal 89; Por Fora 89 |
| CT-MGR-002 | Cristian Chivu, 2026-10-08 | Por Fora 90; Passe Longo 90 |
| CT-MGR-007 | Frank Lampard, 2026-08-13 | Passe Longo 89; Sobreposição 89 |
| CT-MGR-004 | R. Rodríguez, 2026-10-01 | Posse 88; Sobreposição 85 |
| CT-MGR-003 | Makino Tomoaki, 2026-10-01 | Sobreposição 88; Rápido 85 |

Conferir todos os seis números, bônus e Link-Ups por ID na fonte V302; esta tabela é resumo, não documento para alterar os dados originais. Datas e nomes podem variar em bases secundárias; não preencher informações adicionais com inferências.

## Comportamento exigido
1. Listar as 22 versões primeiro, com o restante das 70 acessível; não duplicar nem apagar técnicos.
2. Selecionar versão e estilo pelo ID da edição, mostrando seis proficiências e ambos os bônus documentados.
3. Destacar 89/90; 85–88 são alternativas consultivas. Não tratar 85 como idêntico a 90. Baixos valores continuam disponíveis com ressalvas.
4. Sobreposição pode ser selecionada, mas o motor de PP correspondente ainda não existe: mostrar **pendente**, nunca gerar ficheiro de treino falso ou herdar PP de outro estilo.
5. Habilidades e ímpetos são reavaliados pelo contexto da carta e do estilo **sem equipar ou certificar automaticamente**.
6. Em Outros Elencos, o mesmo catálogo e motor V302 são usados; guardar seleção local por `owner.id + card.id`, sem misturar as 246 cartas com coleções externas.
7. Bônus de técnico NÃO são PP. Links de retratos não conferem direitos de redistribuição; não incluir imagens externas no APK/EXE.
8. Nomes, números e combinações permanecem documentais; popularidade dos técnicos não foi estatisticamente comprovada.

## Testes e aceitação
- `node scripts/test-manager-shortlist-v306.cjs`: as 22 IDs, nomes/proficiências, fonte 70, 246 cartas e isolamento de chaves.
- `npm run check` e testes V302/V303/V305; QA visual no Android e Windows.
- Verificar cache offline e manifestos de integridade, ciclo CI, assinatura e instaladores.
- Não marcar como concluída sem CI/QA e publicação reais. Branch proposta não significa instalação concluída.

## Continuidade
O PROMPT MESTRE DEFINITIVO anexado pelo usuário permanece aplicável integralmente, incluindo paridade funcional entre Minhas Cartas e Outros Elencos, metodologia competitiva inspirada em Rentão e Blackjhon (sem falsa atribuição), seis estilos documentais, cinco fichas calculáveis apenas nos motores homologados, cinco habilidades adicionais e ímpetos por função, isolamento e 246 cartas intocáveis.

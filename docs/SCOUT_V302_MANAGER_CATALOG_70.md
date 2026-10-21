# V302 — catálogo de 70 edições de técnicos, por versão exata

Fonte recebida: `craque_tatico_catalogo_tecnicos_2026-10-21.zip` (arquivos JSON/CSV/XLSX), enviada pelo proprietário em 21/10/2026. A importação mantém **todos os campos do JSON original**, compactados em gzip base64 para uso direto no pacote offline Android/Windows. O conteúdo em `craque-manager-catalog-v302.gz.b64` é conferido por SHA256 do JSON descompactado (`8e80354cbf77c10a454a6a4cc61d76d9945f0a046d61e1b889334e6e0838a34e`).

## Escopo confirmado da origem
- **70 versões de 50 nomes**, não equivale a todos os técnicos do jogo ou à posse destes na conta.
- Seis estilos e respectivas proficiências: Posse, Contra-Ataque Rápido, Contra-Ataque (Long Ball Counter), Por Fora, Bola Longa, Sobreposição (Overload).
- 33 versões com dois ou mais estilos do motor original com proficiência >=85; duas sem estilo >=85.
- 40 versões com Link-Up classificado **não confirmado**; 30 com evidência de base pública de terceiros, não comprovante de posse/ativação na conta.
- Um registro sem data de lançamento; manter **data pendente**, sem inventar edição.
- **70 retratos referenciados por URL, sem autorização/licença de uso comprovada**: nenhum retrato foi incorporado ou baixado no pacote.
- As siglas `CT-MGR-...` são IDs internos do catálogo recebido, **não IDs oficiais de gerente no jogo**.
- Bônus em inglês preservados conforme a fonte: não transformar nomes ou montantes em atributos finais sem comprovação da carta/edição.
- Cartas do usuário mantidas em `SCOUT_V69_AUDITORIA.json`, sem substituição, imagem trocada ou escrita nos treinos.

## Comportamento na ficha principal
1. O usuário escolhe o técnico **por versão exata**, distinguindo lançamentos do mesmo nome.
2. A interface oferece os seis estilos e mostra seus números sem criar competências ausentes.
3. Seleção de um dos **cinco estilos implementados** aciona o motor V220/V251 existente, respeitando níveis/PP, posição comprovada e status consultivo da ficha.
4. Sobreposição é estilo **oficial a partir da v6.0.0**, mas a função de cálculo individual ainda não existe no motor da aplicação: mostrar a proficiência e o aviso de **motor pendente**, sem reusar uma simulação de outro estilo como se fosse Overload.
5. Mostrar bônus, Link-Up e condições de ativação **como informação documental**. Não presumir que as cartas de uma escalação ativam a combinação.
6. Persistir a seleção do técnico localmente para utilização em outras fichas, sem conexão de rede; o catálogo compactado é carregado do próprio script.
7. Escolha não muda PP do catálogo, cinco habilidades, ímpeto fixo/slot, Card ID ou builds aprovadas. A seleção **orienta o estilo de simulação**, não calcula automaticamente o efeito numérico final de uma habilidade de técnico.

## Validações e limitações
- `node scripts/test-manager-catalog-v302.cjs`: hash exato do JSON importado, 70 identidades, seis proficiências, ausência de retratos, pontos de entrada/UI e preservação das 246 cartas.
- `npm run check`, CI de PR, QA visual Android/Windows, smoke builds, CI de release e cinco assets oficiais antes de publicar.
- **Ainda pendente**: algoritmo documentado de Overload, cálculo numérico dos bônus sobre atributos-base completos por edição, validação de Link-Up em escalação real, tradução oficial de nomes sem fonte PT-BR inequívoca e instalação em dispositivos físicos.
- Fontes complementares oficiais: https://www.konami.com/efootball/en/page/v6/versioninfo_v6-00 (Overload oficial e Link-Up duplo); terceiros referenciados no JSON de entrada.

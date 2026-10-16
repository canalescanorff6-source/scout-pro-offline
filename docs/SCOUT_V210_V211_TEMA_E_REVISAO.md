# Scout PRO V210–V211 — identidade visual e auditoria das builds repetidas

## Evidências concretas
- Fontes: somente `web/SCOUT_V69_AUDITORIA.json` e os treinos já registrados no Scout PRO.
- **246 cartas**, **162 treinos registrados**, **84 sem distribuição final no índice**.
- 20 grupos de mesma função, estilo, PP e dez níveis idênticos, abrangendo **56 cartas**.
- 20 grupos possuem pelo menos uma comparação com habilidades nativas e/ou ímpeto fixo documentados diferentes.
- **0 builds oficialmente substituídas**: o índice frequentemente não contém números de atributos-base; repetição não prova erro, nem diferença de habilidade prova melhor PP.

## Regras de revisão por carta
1. Agrupar apenas mesma posição normalizada, estilo, PP e vetor de dez níveis; não agrupar nomes/edições por aproximação.
2. Comparar conjuntos de habilidades nativas e ímpetos fixos apenas se documentados; campos PENDENTE/NENHUM NÃO CONFIRMADO/SLOT SELECIONÁVEL não são tratados como boosters fixos.
3. Mostrar um resumo de prioridade na própria ficha, ao lado do comparador V207. A marcação **revisão prioritária** não equivale a build aprovada.
4. Corrigir uma distribuição registrada somente depois de obter atributos-base reais da edição, função em Posse de Bola e validação de custo PP/status finais, preferencialmente teste prático do usuário.
5. Conservar os 162 vetores antigos, 84 pendentes, habilidades, boosters, artes, Card IDs, configurações e backups.

## Melhorias visuais V210
- Paleta oficial do projeto `--accent:#35e4b9`, `--gold:#e9be71` e grafite do `premium.css`.
- Mantém a **mesma tabela V208** (Categoria/Nível/PP, dez ícones e cabeçalho visual fixo A - Posse central).
- Substitui somente fundo azul, contornos ciano, ícones, rodapé/total e painéis de comparação por superfícies grafite + verde-turquesa e acentos dourados. Android/Windows compartilham a folha.

## Grupos prioritários
- #144 Dean Huijsen / #149 Jan Paul van Hecke / #150 Ibrahima Konaté / #153 Dean Huijsen / #154 Ibrahima Konaté / #158 António Silva / #160 Marc Guéhi / #163 Jérémy Jacquet / #166 Maxence Lacroix — ZG, Defensor criativo, 52 PP; pares com diferença documental 34/36
- #095 Frank Lampard / #099 Joelinton / #102 João Neves / #216 Declan Rice — MLG, Meia versátil, 64 PP; pares com diferença documental 6/6
- #004 David Beckham / #017 Jack Wilshere / #096 Vitinha — MLG, Orquestrador, 64 PP; pares com diferença documental 3/3
- #009 Giorgio Chiellini / #148 Vitão / #157 Renato Veiga — ZG, Básico, 56 PP; pares com diferença documental 3/3
- #030 Tuncay Şanlı / #031 Filippo Inzaghi / #034 Hristo Stoichkov — CA, Oportunista, 60 PP; pares com diferença documental 3/3
- #040 Dwight Yorke / #043 Burak Yılmaz / #182 Marcus Thuram — CA, Artilheiro, 60 PP; pares com diferença documental 3/3
- #070 Denílson / #072 Atep / #076 K. Kvaratskhelia — PTE, Ala produtivo, 60 PP; pares com diferença documental 3/3
- #082 Cole Palmer / #208 Michael Olise / #209 Jamal Musiala — MAT, Armador criativo, 62 PP; pares com diferença documental 3/3
- #169 Oliver Kahn / #173 Mike Maignan / #176 Caoimhin Kelleher — GO, Básico, 56 PP; pares com diferença documental 3/3
- #001 Daniele Massaro / #032 Gabriel Batistuta — CA, Matador, 62 PP; pares com diferença documental 1/1
- #037 Nihat Kahveci / #038 El-Hadji Diouf — CA, Artilheiro, 62 PP; pares com diferença documental 1/1
- #055 Dirk Kuyt / #187 Gonzalo Plata — PTD, Ala produtivo, 62 PP; pares com diferença documental 1/1
- #061 Savinho / #063 Estêvão — PTD, Ala produtivo, 56 PP; pares com diferença documental 1/1
- #079 Neymar Jr / #084 Franck Ribéry — MAT, Armador criativo, 60 PP; pares com diferença documental 1/1
- #089 Iliman Ndiaye / #213 Ethan Mbappé — MLD, Jogador de infiltração, 62 PP; pares com diferença documental 1/1
- #090 Neymar Jr / #093 Matheus Cunha — MLE, Jogador de infiltração, 62 PP; pares com diferença documental 1/1
- #108 N'Golo Kanté / #111 N'Golo Kanté — VOL, Meia versátil, 64 PP; pares com diferença documental 1/1
- #124 Dominik Szoboszlai / #129 Malo Gusto — LD, Lateral ofensivo, 64 PP; pares com diferença documental 1/1
- #134 Mikaël Silvestre / #138 Théo Hernández — LE, Lateral ofensivo, 64 PP; pares com diferença documental 1/1
- #191 Gabriel Martinelli / #198 Cody Gakpo — PTE, Ala produtivo, 66 PP; pares com diferença documental 1/1

## Critérios de QA
- Exigir 20 grupos/54 cartas, comparação documental sem afirmação falsa de estatísticas iguais, 246 registros preservados.
- Exigir paleta real no CSS computado dos 10 ícones, tabela e total nos seis tamanhos 320/360/390/412/1366/1920 px.
- Exigir CI Windows/Android, offline/fingerprint e assinatura persistente; merge e release só com todos os checks GREEN.

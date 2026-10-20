# Craque Tático V269 — arquétipos ofensivos e bloqueio de ímpeto duplicado em PT-BR

## Ponto de partida auditado

- Origem: `main` no merge V268 `e20b2208193dc10f41b69e7247dde8b4b6923fe8` (PR #173, release v1.1.629).
- Catálogo: 246 cartas; cinco táticas = **1.230 cenários consultivos**.
- Proibido converter hipóteses em builds aprovadas, mexer nos vetores de PP, slots reais, Card IDs, nomes, imagens ou progresso.

## Defeito corrigido: ímpeto já instalado com grafia portuguesa

O motor V103 aceita aliases técnicos/portugueses (`boosterName`), mas a camada V162 filtrava ímpetos equipados por **comparação literal com nome em inglês**. Por exemplo, o registro local `Técnica +1` podia ser entendido como distinto de `Technique`, fazendo a escolha já equipada reaparecer no ranking de comparação.

A V269 canoniza ímpeto fixo, segundo ímpeto cadastrado e ímpeto indicado pelo usuário usando a mesma função do motor V103, antes de excluir duplicatas. O ranking continua consultivo: sem comprovação de slot, nenhuma recomendação autoriza equipar.

## Refinamento tático fundamentado no estilo registrado

O V162 agrupava `Puxa marcação`/`Infiltração` e `Artilheiro`/`Oportunista` no mesmo bônus genérico de habilidades de finalização. A V269 distingue:
- **Movimentação de apoio/desmarque** (`Puxa marcação`, `Infiltração`, `Arrastar defesa`): reforça passes, devoluções curtas, calcanhar, recepção e passe ponderado.
- **Finalizador** (`Artilheiro`, `Oportunista`, `Matador`): mantém o reforço em chute de primeira, último passe e finalização acrobática.

É um **ajuste heurístico de prioridades**, não uma afirmação de desempenho comprovado por Blackjhon ou Rentão. Não regrava habilidades; a lista de cinco permanece hipótese sujeita à verificação das habilidades nativas e do equipamento real da carta. Caso uma edição tenha dois estilos registrados, o motor considera ambos e mantém a transparência dos critérios.

## Auditoria e testes

- `scripts/test-competitive-individuality-v269.cjs` verifica **246×5** cenários, ausência de duplicatas entre cinco habilidades recomendadas e nativas reconhecidas, identidade e imutabilidade integral do catálogo.
- Para cada cenário, o teste simula o ímpeto principal como já equipado sob grafias técnicas, PT-BR e `+1`, impedindo sua reaparição no ranking.
- Fixtures sintéticas verificam diferença entre `CA Puxa marcação` e `CA Artilheiro`; não são salvas como cartas reais.
- Gera `build/v269-competitive-diagnostic.json` com distribuição por tática, padrões coincidentes, lacunas nativas e slots indisponíveis. **Repetição entre cartas não é automaticamente erro.**
- Integrado a `npm run check`; versão do cache de serviço atualizada com sufixo V269.

## Critérios de liberação

1. CI `npm run check` verde.
2. Auditoria de integridade das 246 cartas e builds Android/Windows verdes.
3. QA visual em 360/390/1366px, incluindo nenhuma sobreposição de imagem no Windows.
4. PR revisado e merge apenas após todas as verificações; só depois release assinada com APK, EXE, `latest.yml`, checksum e blockmap.
5. Instalação física no dispositivo e avaliação de partidas permanecem separadas, **não devem ser afirmadas como testadas apenas pela CI**.

A V269 **não** comprova que as 246 melhores builds foram alcançadas. Vetores sem prova (especialmente 84 ausentes), 14 bases parciais e edição/Card ID pendentes continuam bloqueios à homologação.

# Craque Tático — V258 | Revisão completa de treinos repetidos por edição

## Finalidade

A auditoria V211 já identificou 20 grupos de treinos registrados iguais que abrangem 56 das 246 cartas. A ficha V251 exibia uma mensagem limitada aos cinco primeiros exemplos, insuficiente para auditar as nove cartas de um grupo de zagueiros. A V258 expõe **todas** as edições participantes de cada grupo diretamente na única ficha principal V220, em detalhes recolhíveis V253.

## Regras da comparação

- Uma repetição só é relatada quando **posição, estilo ofensivo, orçamento de PP e vetor de níveis** da versão são iguais segundo a assinatura V251.
- Cada carta semelhante é apresentada com CAP, nome, **Card ID e descrição da edição**.
- O comparativo aponta diferenças de habilidades nativas, ímpeto fixo e estilo defensivo. A comparação de skills não depende da ordem em que habilidades foram cadastradas.
- A ausência de nível/PP documentados e de atributos-base confirmados é sinalizada por par. Esses indicadores descrevem **falta de prova**, não atributos fracos.
- Repetição não equivale a erro: diferenças de evidência pedem revisão, e igualdade documental não comprova desempenho igual.
- **Nenhuma distribuição nova é atribuída automaticamente.** A mudança não cria ou aplica builds, não usa Overall para classificar e não infere Player ID.

## Casos prioritários

- Zagueiros: grupo iniciado pelo #144 Dean Huijsen e incluindo #149 Van Hecke, #150 Konaté e mais seis edições (nove ao todo).
- Atacantes artilheiros: #040 Dwight Yorke, #043 Burak Yılmaz e #182 Marcus Thuram, com orçamento de 60 PP e treino cadastrado igual. Posição e orçamento iguais não implicam mesmo comportamento em Posse de Bola.
- Grupo de meias versáteis: #095 Lampard, #099 Joelinton, #102 João Neves e #216 Declan Rice. Necessário comparar atributos-base, função tática e habilidades por Card ID.

## Experiência da ficha

A tela continua a ter **uma ficha principal** com auditoria recolhível, sem poluição na primeira dobra. O comparativo de duplicatas apresenta lista completa somente quando o usuário expande a seção. CSS responsivo para Android de 360/390/520 px e Windows, sem overlay fixo.

## Validação e limites

Teste `scripts/test-build-duplicate-evidence-v258.cjs` examina as 246 cartas, 20 grupos e 56 entradas únicas, Card IDs, edições, diferença defensiva por fixture e integridade do acervo. Integrado a `npm run check`, com invalidação de cache offline.

Esse teste comprova **integridade documental e interface**, não equivalência de desempenho em campo. Para homologar uma mudança de build ainda são exigidos prints/vídeos do Card ID exato, atributos-base e partidas comparáveis, conforme metodologia competitiva exigida.

Manter PR separado até CI/QA visual e build de teste; nenhuma release deve ser anunciada antes de publicação comprovada.

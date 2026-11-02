# Meu elenco nas duas contas — V385

Pedido: a conta Secundária deve abrir a mesma experiência Meu elenco da Principal. Cartas novas fornecidas pelo proprietário com capturas eFHUB devem ser destinadas explicitamente a uma conta. A aprovação anterior de contas independentes permanece; esta entrega corrige o fluxo existente conforme o pedido atual, preservando o tema grafite/vinho aprovado.

## Decisão
Reutilizar index.html, seus cartões, busca, filtros e tema; adicionar um adaptador de conta antes do catálogo iniciar. Duplicar o catálogo em outra página criaria duas interfaces divergentes; continuar enviando a Secundária ao planejador não atende ao pedido. Principal mantém as246originais e15próprias; novas cartas privadas são acrescentadas em armazenamento local. Secundária utiliza o mesmo catálogo, com suas próprias cartas. Planejador é uma ferramenta dentro de cada conta.

Ficha de carta cadastrada: mesma estrutura nas duas contas, com resumo/arte, edição, nível/PP, treino por função, técnico/estilo, habilidades, ímpetos e revisões. Reutilizar o motor V382/V383 sem inventar atributos ou resultado de partidas. Ficha individual identifica que a avaliação conjunta depende de montar o time. Cartas principais legadas continuam com suas fichas completas existentes.

## Dados e limites
- Estender o registro de contas V382 com primary.cards/managers opcionais, mantendo leitura de backups antigos sem gravação automática. Nunca mudar o catálogo canônico ou os registros antigos.
- Cadastro/importação com conta explícita; arquivo de outra conta deve ser recusado antes de escrever. O arquivo privado anterior da Secundária permanece aceito apenas nela. Importação idempotente, sem substituir conflitos.
- Mesma edição em duas contas tem estado independente. Reservar identificadores das261cartas legadas. Corrupção/quota falha sem apagar dados. Backups V226 incluem os novos registros pelo prefixo existente.
- Imagens cadastradas são miniaturas locais limitadas; nenhuma captura privada no Git ou na release. Não implementar OCR ou pesquisa automática.
- Conta aparece no catálogo, ficha, importação e plano; links de retorno e navegação mantêm a conta. Não apresentar cartas/revisões/técnicos da Principal como se fossem da Secundária.
- Exportação/importação entre Android e Windows continua por arquivo, sem sincronização implícita.

## Aceitação
Abrir Principal e Secundária pelo mesmo Meu elenco; buscar/filtrar e abrir uma ficha em ambas; importar uma carta para cada conta; obter propostas válidas com PP corretos e pendências explícitas; salvar/reabrir revisões isoladas; restaurar backup antigo; manter261legadas e imagens intactas; UI320/390/1366px, offline e pacotes Android/Windows.

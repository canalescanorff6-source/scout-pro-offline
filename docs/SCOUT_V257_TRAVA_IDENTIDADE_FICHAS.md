# Craque Tático — V257 | Trava de identidade cruzada da ficha

## Problema corrigido

A V256 diferenciou PP matematicamente fechados de nível documentado. Faltava impedir que a chamada ao motor V233 unisse campos de identificação contraditórios da mesma carta. Uma ficha podia conter CAP, Card ID ou versão em duas fontes (cadastro e página) sem que a divergência, por si só, barrasse a hipótese de redistribuição.

## Regra V257

1. Se CAP estiver disponível nos campos capture e numero, ambos devem se referir ao mesmo inteiro positivo. 191 e 0191 são equivalentes.
2. Se Card ID estiver em id e card_id, ambos devem coincidir literalmente após retirar espaços externos.
3. Se edição estiver em edition e versao, ambas devem coincidir após retirar espaços externos.
4. Se algum par divergir, compare retorna proposal null e motivo explícito em PT-BR. A interpretação do papel permanece disponível, porém marcada pendente.
5. O painel apresenta o conflito antes de qualquer mensagem de orçamento documentado; não confunde divergência de edição com falta de PP.
6. Posição original e posição efetivamente treinada podem ser diferentes e não são tratadas como conflito de Card ID; o V246 continua responsável pela comprovação de familiaridade.

Quando apenas um alias está presente, a V257 não pressupõe prova externa. As travas documentais da V256 permanecem obrigatórias.

## Escopo preservado

- Nenhum dado das 246 cartas, Card IDs, níveis, PP, imagens, habilidades, ímpetos ou builds é modificado.
- Saves, backups, equipes e as cinco táticas continuam intactos.
- Os módulos JS são os mesmos nas plataformas Windows/Electron e Android/Capacitor. O cache offline passa a indicar V257.
- A análise continua consultiva e NÃO constitui validação competitiva de treino, Player ID, atributos finais ou performance em partidas.

## Regressão

O teste scripts/test-edition-identity-v257.cjs percorre as 246 edições nos cinco estilos (1.230 verificações), compara todos os aliases iguais, rejeita seis tipos de conflito nas cinco táticas (30 bloqueios), preserva a ausência de mutações e utiliza uma fixture sintética de 50 PP do Martinelli #191 sem alterar a ficha real.

O teste integra npm run check. Exigir CI, auditoria de dados e QA visual antes de merge e release oficial. A versão v1.1.588 é a base anterior à V257, não uma entrega desta branch.

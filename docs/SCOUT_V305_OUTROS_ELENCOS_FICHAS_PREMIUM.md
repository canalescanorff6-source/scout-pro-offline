# V305 — Outros Elencos premium com fichas efetivamente acessíveis

## Problema de usabilidade
A V228 já calculava cinco hipóteses de treino e fazia sugestões de habilidades/ímpetos por tática, mas escondia o resultado em um modal muito denso, acionado por "Ficha completa". No acervo Bruno Santos CD com Zico 106 SA, sem PP nem nível confirmados, a ficha de treino não pode ser preenchida matematicamente. Isso não deve parecer uma falha da interface nem uma ficha zerada.

## Fluxo V305
- **Outros Elencos**: etapas claras pessoa → carta → ficha; identidade visual premium grafite/azul profundo e dourado.
- A lista de cartas exibe por carta a disponibilidade dos cinco estilos, status dos PP e o botão destacado **Ver ficha do app**. O mesmo funciona para Bruno Santos CD ou qualquer outra coleção particular; sem novo catálogo e sem entrar nas 246 cartas pessoais.
- **Ficha do app**: imagem real cadastrada (ou placeholder), nome, edição, posição, estilo e PP; cinco abas com nome da tática e estado "PP · hipótese" ou "Treino pendente". Botões de áreas **Treinamento / 5 habilidades / Ímpetos**, sem empilhar toda a densidade no celular. Botão **Completar dados da carta** retorna ao cadastro correto.
- A distribuição PP vem do motor existente `CRAQUE_FRIEND_TRAINING_V228.evaluate(card,tactic)`; **nada pré-renderizado/fixo**. Ao trocar de estilo, reconstituir o painel com proposta, recomendações e classificações daquele estilo. Cache somente durante a sessão da ficha; revalidar depois de salvar.
- **Gerar e salvar 5 fichas** chama o método existente `generate` e grava `analysis` V228 dentro da coleção correta, preservando backups V227/V226. A persistência V228 armazena os cinco *vetores de PP* e confiança; habilidades e ímpetos são recalculados ao consultar e incluídos no JSON de exportação, nunca declarados equipados.
- Se PP, identidade exata, nativas ou ímpetos não estão comprovados, suas recomendações continuam **condicionais** e os estados aparecem na interface. Zico 106 SA permanece com Card ID, nível e PP desconhecidos; não atribuir atributos, treinos ou endosso a Rentão e Blackjhon.
- O catálogo de 246 cartas e as coleções já armazenadas não mudam de estrutura nem têm migração destrutiva.

## Quality gates
- `node scripts/test-friends-premium-v305.cjs`: cinco hipóteses/pendências por carta, idempotência de backup, Card ID e PP ausentes do Zico, seções de acesso e botão de edição.
- `npm run check` mais auditoria 246 cartas e QA visual 8 viewports.
- Compilação real Android e Windows, assinatura persistente, asset e manifesto da release somente após CI GREEN.
- Instalação física e restauração local pós-release seguem sem alegação de aprovação até verificação em dispositivos reais.

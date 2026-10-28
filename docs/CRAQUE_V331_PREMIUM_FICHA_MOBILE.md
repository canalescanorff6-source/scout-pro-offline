# Craque Tático — V331: seleção compacta de posição e formação nas fichas

**Base auditada:** a V330 já foi integrada por PR #243 e publicada como v1.1.934 antes deste ciclo. Por isso V331 não repete a V330 e continua a priorização documentada.

## Problema confirmado
No painel individual V311 de cada carta, mesmo após V326/V327 as opções "Usar como" e "Simular vaga da formação" ficam permanentemente expandidas antes de qualquer recomendação. Isso alonga o topo e gera a impressão equivocada de que a posição original foi alterada. As opções de formação 4-3-1-2 e 4-2-1-3 já existiam no motor V314, mas não tinham distinção suficientemente clara entre **posição original** e **posição simulada em campo**.

## Alteração implementada
- Painel contextual **"Em análise: POSIÇÃO · FORMAÇÃO"** com destaque à posição consultada e nota de que o registro original continua intacto.
- Ação grande de 44px **"Trocar posição ou formação"** abre explicitamente os seletores V311/V314, normalmente ocultos. Eles permanecem reais, interativos e em pleno funcionamento.
- Redução da altura inicial no celular: dois seletores e o texto de orientação deixam de ocupar espaço até o usuário solicitar a escolha.
- A lista de vagas usa o mapeamento original do V314 (11 para cada formação) e chama a mesma função de mudança de contexto já testada em MAT→SA→MAT.
- CSS Premium azul-noite/dourado e foco de teclado; sem gravar alterações somente por abrir ou fechar.
- O componente compartilhado de ficha é usado em Minhas Cartas, Outros Elencos e simulações de escalação: sem migração nem alteração de cartas.

## Salvaguardas
- **246 cartas intocadas**, PP, habilidades, ímpetos, nível, Card ID, edição, builds homologadas e equipes aprovadas preservados.
- O painel não grava cenário ao abrir ou fechar, e não afirma familiaridade de posição que não foi documentada.
- Alterações de posição somente passam pelos eventos V311 já existentes; a visualização não altera automaticamente o elenco real.
- Cache offline V331 atualizado para Android e Windows, sem dependência de servidor.

## Testes
- `scripts/test-mobile-position-focus-v331.cjs` integra `npm run check` e verifica 246 cartas, onze vagas em ambas as formações, manutenção do seletor V314, painel recolhível, botão real e nenhuma gravação no clique de abertura.
- QA V326 atualizado para testar o painel recolhido e a ausência de mutações de chaves locais ao abri-lo, nos viewports Android/Windows.
- QA V311, V314, V325 e V327 abrem o seletor antes de testar trocas reais. As demais regressões continuam sendo obrigatórias.
- **Release bloqueada até CI + QA completo + teste Android/Windows assinados serem verificados.**

## Próximas oportunidades
- Continuar auditoria de usabilidade de escalação real no mobile, com feedback do proprietário sobre altura, leitura e fluidez após a instalação.
- Consolidar a navegação por posição e técnico sem sacrificar os históricos contextuais.
- Criar um resumo de partidas realmente comparáveis no laboratório sem ranking por Overall.

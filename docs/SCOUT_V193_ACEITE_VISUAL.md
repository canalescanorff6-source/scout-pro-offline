# Scout PRO V193 — fechamento visual e aceite

## Melhorias entregues nesta etapa
- O selo do catálogo não apresenta mais o rótulo herdado "V73": a interface usa a versão do próprio pacote quando o manifesto offline está disponível.
- O atalho "Ver as cinco habilidades adicionais" some **somente** se o painel real V162 já estiver integrado à ficha V188. Se não estiver, o atalho original permanece.
- Telas compactas de 320–420 px recebem ajustes em filtros, busca, barra inferior e botões de estilo tático, sem remover opções.
- Áreas de toque com altura mínima e comportamento de animação reduzida.
- Mesma web/ e CSS V192 no Electron e Capacitor; cache invalidado para o refinamento V193.
- Teste scripts/test-ui-v193.cjs incorporado a npm run check; nenhum dado ou imagem de carta foi alterado.

## Critérios de aceite visuais — pendentes de homologação manual
| Área | Android 320/360/412 px | Windows 1366×768 / 1920×1080 | Situação |
|---|---|---|---|
| Home: logo, busca e quatro atalhos | Comparar largura, altura, espaçamento | Conferir hero e imagens originais | Automação estrutural; QA visual pendente |
| Catálogo 246 cartas | Grid 2 colunas sem cortes e filtros roláveis | Grade sem desalinhamentos | Automação estrutural; QA visual pendente |
| Ficha: arte, nível, PP | Cabeçalho e treino legíveis | Proporção arte e conteúdo | QA visual pendente |
| Ímpetos | Dois observados + sugestão, sem duplicar | Colunas alinhadas | Automação de dados; QA visual pendente |
| Habilidades | 5 sugestões ou avisos, botão sem duplicar | Mesmo motor e seção | Teste estrutural V193 |
| Biotipo | Recolhível, sem medidas inventadas | Expandido e legível | Teste estrutural V192 |
| Navegação / instalação | Atualizar, voltar, cartão seguinte, assinatura | Instalação/atualização | CI de builds; aparelho real pendente |
| Identidade com mockup original | Captura lado a lado necessária | Captura lado a lado necessária | **Referência visual indisponível** |

## Critério para declarar 100% idêntico
É indispensável recuperar a imagem original aprovada e comparar screenshots reais no mesmo viewport. CI verde não comprova fidelidade pixel a pixel; sem o arquivo visual de referência, não atribuir percentual exato nem prometer equivalência.

## O que não mudar
Preservar 246 cartas, imagens originais, Card IDs, PP, builds, nativas, slots, ímpetos registrados, histórico, navegação e recursos offline. A decisão sobre habilidades/ímpetos permanece com o usuário; não inferir resultados de gameplay nem priorizar Overall.

# Craque Tático V272 — pacote de engenharia competitiva das 246 cartas

## Origem e limites
Parte da `main` V271 (commit `6ff18f141ac26d408109883b80da53d44f83deca`, release `v1.1.640`). **Não criar outro aplicativo** nem trocar carta, Card ID, edição, imagem, nível, PP, build principal, treinamento aprovado, booster fixo, skill nativa, slots informados ou registro local de equipamento.

**Metodologia:** eFootball 2027 por Card ID exato; função tática *confirmada* e estilos ofensivo/defensivo da edição; PP como investimento matemático, não status final; cinco habilidades adicionais sem repetir nativas ou já equipadas; ímpetos apenas quando a edição permitir e o usuário confirmar. Referências Rentão e Blackjhon são padrões de rigor; nenhuma ficha é apresentada como criada/aprovada por eles sem vídeo da versão exata. Nenhuma pontuação prediz vitória em partida.

## Mudanças do pacote

### Motor de ímpetos (V103, versão de código mantida para compatibilidade)
1. Suporte a alias de zagueiro `ZG` usado em formações confirmadas.
2. Papel de primeiro volante, trinco e orquestrador diferencia contenção e saída curta.
3. Meia versátil de ida e volta ganha leitura de passe, resistência e cobertura.
4. Segundo atacante que puxa marcação cria apoios centrais.
5. Ala produtivo e armador aberto passam a priorizar domínio, passe curto e condução conforme função.
6. Interceptação e bloqueio *nativos documentados* podem informar cobertura.
7. Passe ponderado / passe aéreo baixo documentados informam distribuição.
8. Espírito guerreiro / Track Back informado pode contribuir no esforço consultivo.
9. Zagueiro construtor versus destruidor têm diferenças de desempate para Regista/Passing/Rebuilding versus Shutdown/Duelling/Stealing.
10. Laterais defensivos e ofensivos ganham prioridades distintas para proteção/apoio.
11. Volantes, MAT, MLG, SA, alas e goleiros recebem critérios por tática, nativas e função, sem forçar diversidade.
12. Resultado traz perfil documentado, componentes do score, status de dados-base e advertência explícita de não homologação.

### Cinco habilidades adicionais (V162)
13. Novas ramificações por pivô, finalizador, apoio, infiltração, meia organizador, meia versátil, dois volantes, zagueiro construtor, zagueiro destruidor, lateral defensivo/ofensivo, ala produtivo e goleiro defensivo/ofensivo.
14. Complementaridade individual: *Passe de primeira* ↔ *Passe em profundidade* sem recomendar duplicata.
15. Complementaridade de nativas defensivas Interceptação ↔ Bloqueador e recomposição.
16. Complementaridade de jogo aéreo e cabeceio sem inferir atributos finais.
17. Finalizadores com Chute de primeira nativo ganham opções de passe/apoio.
18. Alas com Track Back e goleiros com reposição baixa são diferenciados.
19. Não declarar lista com cinco slots equipáveis sem validação da conta.
20. Nomes manuais fora do vocabulário PT-BR/EN agora bloqueiam confirmação indevida; nomenclatura deve ser conferida.
21. Habilidades manuais duplicadas com nativas impedem certificado local de cinco vagas.
22. Todas as sugestões permanecem vinculadas à função real e sem preenchimento automático.

### Interface da ficha principal
23. Identidade visual do escudo Craque Tático: azul-noite, grafite e dourado; menos verde chamativo.
24. Rankings de 01 a 05, motivos curtos e painel recolhível de pontuação individual (função, tática, estilo, habilidades nativas).
25. Resumo visível de função, tática, nativas, PP e evidência do segundo slot.
26. Comparador recolhível de três ímpetos: nota, quatro atributos e justificativa.
27. O parecer competitivo V251 passa a mostrar margem e opções comparativas, sem segunda build concorrente.
28. Proteção da leitura em largura reduzida, texto longo e ações de toque >= 40 px.

## Auditoria, artefatos e publicação
- `scripts/test-mega-individuality-v272.cjs`: **246×5 = 1.230** cenários; 246 identidades imutáveis, orçamento PP validado, Martinelli #191 (nível 26, PP 50) ainda provisório, exclusão de ímpeto fixo, máximo de 5 adicionais, exclusão de skill nativa, conflitos de equipamento, defesa dos slots e explicação do ranking.
- `build/v272-competitive-246x5.json`: cada CAP + Card ID + edição, habilidades por tática, top 2 ímpetos, margem, confiança e pendências. Publicar como artifact CI.
- `npm run check` e workflow CI integrados; versão do service worker renovada para sincronização de código web dos dispositivos.

**Critérios de liberação:** CI verde; integridade das 246 fichas; Android debug; Windows NSIS; QA visual 8 resoluções sem problemas; PR merge após SHA do HEAD; CI+QA na `main`; APK assinado, SHA256, EXE, blockmap e `latest.yml` publicados. Teste físico de instalação e partidas continua pendente após o release.

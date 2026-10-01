# Navios — contexto técnico

## Projeto

- React, TypeScript, Vite e CSS comum; interface responsiva com mapa e gerenciamento da frota.
- Leaflet/React Leaflet e cartografia OpenStreetMap; tema salvo no navegador.
- Versão 1.3.0 publicada no aplicativo existente, com Dataverse, estado dos navios e perfil da sessão.
- Identificadores, conta, destino de publicação e contexto pessoal ficam em arquivos locais ignorados pelo Git.

## Integração Dataverse — 01/10/2026

- Fonte da tabela Navios registrada pelo CLI local pa, preservando o aplicativo e a solução configurados.
- Modelos/serviços oficiais em src/generated; descrição de runtime em .power/schemas/appschemas.
- Metadados brutos em .power/schemas/dataverse ignorados por conterem identificadores internos.
- createDataverseShipService implementa list/create/update/setState/remove e preserva IDs.
- Latitude/longitude da tabela são texto: leitura aceita ponto/vírgula, gravação usa representação numérica com ponto.
- Posições ausentes ou inválidas são null: registros permanecem editáveis na lista, sem marcadores falsos no mapa.
- MMSI e outros campos não editados pela interface permanecem preservados no Dataverse.
- Consultas paginadas e compartilhamento de chamadas simultâneas em andamento.
- Métodos gerados usados para leitura/cadastro/edição. Exclusão verifica o resultado via cliente oficial SDK, porque o método gerado descarta success/error.
- Development e production usam Dataverse. Somente o modo test carrega o adaptador fictício.
- Local Play do plugin Vite fornece a sessão Power Apps necessária para acessar dados reais.
- A tabela foi consultada e estava vazia; nenhum dado de amostra ou registro de teste foi inserido nela.

## Funcionamento preservado

- Diálogos com proteção contra eventos close atrasados do StrictMode.
- Botão de tema com espaço reservado fora da área de rolagem.
- Sidebar-note svg com height: 35px.
- Mapa, popup e lista responsivos; cadastro e mapa compartilham ShipsProvider.
- Atualizar lista nas duas páginas e tratamento de erros com Tentar novamente.

## Validação

- Build e lint aprovados.
- 18 testes aprovados: 13 de contratos/Dataverse/perfil e cinco fluxos de interface em Edge headless.
- Testes de interface usam modo test com dist-e2e; não alteram a tabela real.
- Produção usa dist e não inclui o adaptador mock.
- Usuário confirmou funcionamento do CRUD no Local Play. Ativação/desativação e perfil real desta evolução aguardam conferência na sessão autenticada.

## Continuidade

- Preservar IDs, configuração, aplicativo, ambiente e solução existentes.
- Compilar antes de qualquer publicação e verificar os destinos locais.
- Credenciais permanecem nos caches das ferramentas, fora do projeto.
- Não fazer commit ou enviar alterações ao Git sem pedido explícito do usuário.

## Estado dos navios e perfil da sessão — 01/10/2026

- Ship inclui stateCode: 0 | 1. Fonte Dataverse seleciona statecode na listagem.
- Ativar/desativar envia exclusivamente { statecode: 0 | 1 }, conforme pedido explícito do usuário. Não incluir statuscode em alterações futuras sem autorização específica.
- Lista mantém ativos e desativados, com estado visível e ações Ativar/Desativar, Editar e Excluir.
- Mapa, cartões, contador e Ver frota consideram somente ativos; coordenadas inválidas continuam sem marcadores.
- Edição de inativo preserva estado. PATCH sem representação exige leitura posterior do registro salvo.
- Perfil usa getContext da sessão do host e o conector Office 365 Users para e-mail/foto do ID da sessão.
- SessionUserMenu no cabeçalho, com popover nativo para detalhes, disponível também no celular. SVG quando foto está ausente, falha ou não carrega.
- Fonte Office 365 Users registrada pelo CLI oficial; gerados intactos. Esquema bruto do conector ignorado; runtime em appschemas.
- Testes de perfil usam identidade fictícia apenas no modo test. Produção não inclui os dois serviços mock.
- Build/lint aprovados; 18 testes passaram; detector visual sem achados; desktop/celular revisados.
- Não houve alteração de registros reais durante os testes, publicação, commit ou envio ao Git nesta evolução.
## Publicação 1.3.0 — 01/10/2026

- Usuário autorizou explicitamente publicar no Code App existente e reafirmou a proibição de commit.
- Build de produção aprovado imediatamente antes do push; sem bundles de serviços mock.
- pa app push com a solução existente retornou success: true e a URL do mesmo aplicativo.
- pa app list confirmou o mesmo App ID e nome Code App React; nenhum aplicativo novo criado.
- URL de reprodução e IDs preservados no contexto privado CONTEXTO_NAVIOS_POWER_APPS.local.md.
- Publicação inclui Dataverse, Ativar/Desativar enviando apenas statecode, mapa somente com ativos e perfil da sessão com foto/SVG.
- Build/lint e 18 testes isolados aprovados antes desta publicação. Conferência funcional no player publicado ainda depende da sessão autenticada do usuário.
- Nenhum comando Git executado. Cópias de compartilhamento e checkout GitHub não sincronizados.
- Última publicação: 2026-10-01 20:53:46 UTC.

## Canvas App Navios — rascunho em coautoria, 01/10/2026

- Três telas nativas: mapa, lista e cadastro/edição; fontes Navios e Office 365 Users adicionadas pelo usuário no Studio.
- Dataverse é a fonte única; criação/edição/exclusão por GUID. Ativar/desativar escreve somente Status (statecode), omitindo statuscode; edição preserva campos não editados.
- Mapa nativo inclui apenas ativos com coordenadas válidas; foco/Brasil/frota atualizam propriedades padrão. Ajuste de extensão é aproximado e a projeção respeita os limites de linhas do Canvas.
- Perfil da sessão com nome/e-mail/foto/SVG, tema claro/escuro com preferência quando armazenamento do host permitir, validação e estados de erro/carregamento/vazio.
- Compilação aprovada, AppChecker sem problemas; acessibilidade sem erros, uma sugestão para o nome da tela inicial preservada.
- 23 ações,8 campos obrigatórios e26 cenários revisados estaticamente;125 controles. Roundtrip de coautoria confirmou as três telas e fórmulas no servidor. Runtime NÃO EXECUTADO; nenhum registro real alterado nos testes.
- Validador adicional exigido pela skill indisponível: scripts/validate-canvas-acceptance.cs não existe na instalação. Verificação estrutural independente aprovada; não confundir com execução do validador oficial ou teste no player.
- Canvas não publicado. Após revisar no Studio, salvar e testar com ▶. Code App React publicado permanece em1.3.0. Nenhum comando Git, commit ou envio executado.
- YAML, planejamento e evidências movidos para ../meuCanvasApp, projeto separado do React; detalhes de destino no contexto privado.
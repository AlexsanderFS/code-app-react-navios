# Navios — React + Power Apps Code App

Aplicação responsiva para visualizar e gerenciar a frota cadastrada no Dataverse.

## Funcionalidades

- Header, menu lateral no desktop e drawer no tablet/celular.
- Temas claro/escuro, com preferência salva no navegador.
- Mapa Leaflet/React Leaflet com OpenStreetMap, zoom, pan, nomes e popups.
- Cadastro, edição e exclusão persistentes na tabela Navios, com confirmação e validação das coordenadas.
- Ativar/desativar altera somente statecode no payload. Todos permanecem na lista; apenas ativos com posição válida aparecem no mapa.
- Perfil da sessão no cabeçalho, com nome, e-mail e foto; SVG quando não há foto. No celular, toque no avatar para abrir os detalhes.
- Atualizar lista consulta novamente os registros; mapa e cadastro compartilham o estado.
- Registros sem coordenadas válidas permanecem na lista para correção e não recebem marcadores no mapa.
- Falhas de acesso aparecem com a opção de tentar novamente; não há substituição automática por dados fictícios.

## Executar com Dataverse

Requer Node.js 22 ou superior e a configuração local do aplicativo existente.

```sh
npm ci
npm run dev
```

Abra o endereço **Local Play** exibido pelo plugin Vite. Ele executa a versão local dentro do Power Apps e usa a sessão Microsoft do usuário para acessar o Dataverse. O endereço localhost direto não fornece a autenticação e os serviços do Power Apps.

A autenticação administrativa do PAC e do CLI pa é separada da sessão usada pelo aplicativo no navegador. Cada usuário precisa de acesso ao aplicativo e das permissões de leitura/cadastro/edição/exclusão na tabela.

Para configurar outro ambiente, preserve ou preencha power.config.json e registre sua tabela usando o CLI local:

```sh
npx --no-install pa app add data-source --connector dataverse --table <nome-logico-da-tabela>
```

Não execute init em um projeto já publicado. A tabela precisa ter os campos utilizados pelo adaptador.

## Arquitetura

| Diretório | Responsabilidade |
| --- | --- |
| src/components | Layout, ícones, diálogo e formulário |
| src/pages | Mapa e gerenciamento de navios |
| src/context | Estado compartilhado e tema |
| src/types | Ship, ShipInput e posições válidas |
| src/domain | Validação, conversão e formatação |
| src/services | Contrato ShipService, adaptador Dataverse e adaptador isolado de teste |
| src/generated | Modelos e serviços gerados pelo CLI oficial |
| .power/schemas/appschemas | Descrição da fonte de dados usada pelo SDK |
| tests | Contratos dos serviços e fluxos no navegador |

O adaptador converte latitude e longitude armazenadas como texto, aceita ponto/vírgula e mantém os IDs do Dataverse. Campos não utilizados pela interface, como MMSI, são preservados nas edições.

As consultas percorrem todas as páginas retornadas pelo SDK e compartilham chamadas simultâneas em andamento. Cadastro e edição usam o serviço gerado. Exclusão usa o mesmo cliente oficial do SDK para verificar success/error, pois o método de exclusão gerado descarta esse resultado. Os arquivos gerados permanecem intactos. Alterações de estado enviam apenas statecode (0 ativo, 1 inativo), sem enviar statuscode. Edições comuns preservam o estado; quando o PATCH retorna sem conteúdo, o adaptador consulta o registro salvo.

O perfil usa getContext do SDK para identificar a sessão. O conector Office 365 Users consulta e-mail e foto desse mesmo usuário, pelo ID da sessão; não usa o perfil do proprietário da conexão. Falhas no conector mantêm os dados disponíveis do contexto e o avatar SVG, sem impedir o acesso à frota. Nome, e-mail e foto não são persistidos pelo aplicativo.

Em outro ambiente, registre uma conexão Office 365 Users e sua fonte de ações usando o CLI pa antes de executar o perfil. A configuração da conexão real permanece no arquivo privado power.config.json.

## Verificação isolada

```sh
npm run build
npm run lint
npm run test:e2e
```

Os testes criam uma compilação em **dist-e2e/** com modo test e dados fictícios. Verificam a interface nos cinco tamanhos e o adaptador Dataverse com respostas controladas. Não alteram os registros da tabela real. **dist/** continua contendo a compilação de produção que usa Dataverse.

Para testar StrictMode com um servidor de desenvolvimento isolado, inicie `npm run dev -- --mode test` em outra porta e defina SHIP_TEST_URL com a URL local antes dos testes. Nunca aponte a suíte de CRUD para o aplicativo real.

Para consultar dados reais em desenvolvimento, abra o Local Play do servidor iniciado sem --mode test. CRUD real e persistência devem ser validados nessa sessão autenticada ou no aplicativo publicado.

## Configuração privada e publicação

power.config.example.json e power-platform.example.json são modelos. As configurações reais, o contexto pessoal, os metadados brutos de geração, os diagnósticos e caches de login permanecem locais e ignorados pelo Git. A cópia de compartilhamento é independente do projeto original.

A publicação utiliza o CLI instalado no projeto, preserva o aplicativo e a solução existentes e exige uma compilação aprovada. A versão 1.3.0 foi publicada no aplicativo existente. Novas publicações exigem autorização explícita do usuário.

A cartografia precisa de https://tile.openstreetmap.org nas fontes img-src da CSP do ambiente. scripts/configure-map-csp.mjs consulta a configuração por padrão; --apply modifica o ambiente e exige autorização administrativa.

Não coloque senhas, tokens ou chaves no código React nem em variáveis VITE_*, pois essas variáveis são enviadas ao navegador.

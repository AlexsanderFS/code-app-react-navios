# Navios — React + Power Apps Code App

Aplicação responsiva para visualizar e gerenciar navios fictícios no litoral brasileiro.

## Funcionalidades

- Header, menu lateral no desktop e drawer no tablet/celular.
- Temas claro/escuro, com preferência salva no navegador.
- Mapa interativo Leaflet/React Leaflet com cartografia OpenStreetMap, zoom, pan, nomes e popups.
- Cadastro, edição e exclusão com confirmação e validação das coordenadas.
- Mapa e cadastro compartilham o estado. Os registros são fictícios e as alterações são reiniciadas ao recarregar.

## Executar

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Abra a URL indicada pelo Vite. A aplicação também funciona localmente sem configuração do Power Apps. O plugin da plataforma é habilitado quando existe um arquivo local power.config.json.

## Arquitetura

| Diretório | Responsabilidade |
| --- | --- |
| src/components | Layout, ícones, diálogo e formulário |
| src/pages | Mapa e gerenciamento de navios |
| src/context | Estado compartilhado e tema |
| src/types | Ship e ShipInput |
| src/data | Registros fictícios iniciais |
| src/domain | Validação e formatação |
| src/services | Contrato assíncrono e adaptador em memória |
| tests | Contrato do serviço e fluxos no navegador |

A futura integração com Dataverse deve implementar ShipService e substituir o adaptador em src/main.tsx. O mapa e os formulários continuarão usando o mesmo contrato. Esta versão utiliza somente dados locais de demonstração.

## Verificação

```sh
npm run build
npm run lint
npm run test:e2e
```

Os testes usam Microsoft Edge headless e verificam mapa, temas, navegação, CRUD e sincronização em desktop, notebook, tablet e celular. Para testar um servidor de desenvolvimento já iniciado, defina SHIP_TEST_URL com a URL local.

Os diálogos preservam a compatibilidade com o StrictMode do React. DESIGN.md registra as convenções visuais.

## Configuração privada do Power Apps

power.config.example.json contém somente a estrutura de exemplo. Em uma configuração própria, copie-o para power.config.json e preencha os dados do seu aplicativo e ambiente. Para um projeto já configurado, preserve o arquivo local existente.

A publicação utiliza o CLI instalado no projeto e deve ser precedida de uma compilação aprovada. O ID da solução é uma configuração local da instalação.

Para manutenção administrativa de CSP, copie power-platform.example.json para power-platform.local.json e preencha os identificadores e a conta autorizada da sua instalação. O script scripts/configure-map-csp.mjs consulta a configuração por padrão; --apply grava a exceção no ambiente e requer autorização administrativa.

A cartografia carrega imagens de https://tile.openstreetmap.org. Em um Code App publicado, esse domínio precisa constar nas fontes personalizadas de img-src na política CSP do ambiente.

Referências: [CSP para Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy), [React Leaflet](https://react-leaflet.js.org/docs/start-installation/) e [política de tiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

## Compartilhamento

Configuração real, contexto pessoal, diagnósticos, arquivos de ambiente e cache de login são locais e estão excluídos pelo .gitignore. Os arquivos de exemplo não contêm dados de uma organização.

Não coloque senhas, tokens ou chaves de API no código React nem em variáveis VITE_*. Essas variáveis são incluídas no código enviado ao navegador.

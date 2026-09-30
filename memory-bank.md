# Navios — contexto técnico

## Projeto

- React, TypeScript, Vite e CSS comum.
- Interface responsiva com mapa, gerenciamento de navios e temas claro/escuro.
- Leaflet/React Leaflet com cartografia OpenStreetMap.
- Dados fictícios em memória; cadastro e mapa compartilham ShipsProvider.
- ShipService define list/create/update/remove. A integração futura troca o adaptador em src/main.tsx.
- Identificadores, conta, destino de publicação e histórico pessoal ficam exclusivamente em arquivos locais ignorados pelo Git.

## Funcionamento preservado

- Diálogos nativos com proteção contra eventos close atrasados do StrictMode.
- Botão de tema com espaço reservado fora da área de rolagem.
- Popup do mapa com espaço para os controles no celular.
- Mapa e lista da frota lado a lado em telas amplas.
- Nomes, coordenadas, zoom, pan e CRUD com validação.

## Validação e manutenção

- npm run build, npm run lint e npm run test:e2e.
- Testes em desktop, notebook, tablet e celular.
- README.md descreve como executar e preparar uma configuração própria.
- DESIGN.md registra o sistema visual.
- power.config.example.json e power-platform.example.json são modelos sem dados reais.
- Preservar o aplicativo existente quando houver uma configuração local. Conferir o destino antes de publicar.
- A política CSP do Power Apps deve permitir o domínio das imagens do mapa em img-src.
- Não adicionar Dataverse, autenticação complexa ou APIs de navios sem uma nova definição de escopo.
- Não salvar credenciais nos componentes, nos modelos de configuração ou nos arquivos de diagnóstico.

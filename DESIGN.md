# Design do Navios

Refinamento do sistema existente em 30/09/2026, orientado pela skill Impeccable no modo Operate.

## Direção
Aplicação marítima de trabalho: azul profundo, verde para ações/seleção e superfícies neutras. Preservar as duas views, os dados de demonstração, o mapa real e os fluxos de cadastro existentes. Não usar estatísticas, indicadores de rastreamento ou alegações operacionais sem dados reais.

## Sistema
- Uma família de fontes de sistema: Segoe UI, system-ui. Títulos em escala fixa, texto secundário legível, coordenadas com numerais tabulares.
- Cores semânticas em src/index.css, com variantes light/dark e uma superfície própria para a navegação.
- Painéis com borda discreta e raio de 14px; botões e campos compartilham as convenções existentes. O verde destaca ação primária e seleção, vermelho sinaliza exclusão/erros.
- Controles principais com área de toque de pelo menos 44px e campos com fonte de 16px. Manter foco visível e preferência de movimento reduzido.

## Composição
- A partir de 1280px, o mapa e a lista da frota aparecem em duas colunas. A lista oferece nome e coordenadas para localizar cada marcador.
- Nas demais telas, a lista segue abaixo do mapa; até 900px, a sidebar vira drawer.
- Até 640px, a tabela apresenta os registros em cartões com rótulos das coordenadas e ações explícitas.
- A faixa inferior reservada ao botão de tema permanece fora da área de rolagem. Atribuição OpenStreetMap e controles de zoom permanecem acessíveis.
- Os estilos do Leaflet usam especificidade suficiente para manter o tema mesmo no carregamento sob demanda.

## Limites de implementação
React, CSS comum e ícones SVG existentes; sem novas dependências. Preservar o diálogo nativo e a proteção contra eventos close atrasados do StrictMode. Não alterar o adaptador de dados nem a configuração Power Apps.

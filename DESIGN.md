---
name: Portal da Transparência OAB-AL
description: Prestação pública de contas com identidade institucional sóbria, densa e legível.
colors:
  institutional-navy: '#263851'
  institutional-navy-deep: '#1E293B'
  oab-red: '#CC3366'
  public-action: '#0284C7'
  text-primary: '#333333'
  text-muted: '#69727D'
  surface: '#FFFFFF'
  surface-subtle: '#EDEFF1'
  surface-institutional: '#E2ECF8'
  border-subtle: '#E5E7EB'
  success: '#008236'
  danger: '#EF4444'
typography:
  display:
    fontFamily: 'Inter, sans-serif'
    fontSize: 'clamp(32px, 6vw, 64px)'
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: '-0.03em'
  headline:
    fontFamily: 'Inter, sans-serif'
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 'normal'
  title:
    fontFamily: 'Inter, sans-serif'
    fontSize: '16px'
    fontWeight: 500
    lineHeight: 1.125
    letterSpacing: '0.01em'
  body:
    fontFamily: 'Inter, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: 'Inter, sans-serif'
    fontSize: '13px'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 'normal'
rounded:
  control: '4px'
  panel: '8px'
  card: '12px'
spacing:
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  metric-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.institutional-navy}'
    typography: '{typography.body}'
    rounded: '{rounded.card}'
    padding: '12px 16px'
  category-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.institutional-navy}'
    typography: '{typography.label}'
    rounded: '{rounded.panel}'
    padding: '16px'
  category-card-active:
    backgroundColor: '{colors.institutional-navy}'
    textColor: '{colors.surface}'
    typography: '{typography.label}'
    rounded: '{rounded.panel}'
    padding: '16px'
  field:
    backgroundColor: '{colors.surface-subtle}'
    textColor: '{colors.text-primary}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '10px 36px 10px 16px'
    height: '43px'
---

# Design System: Portal da Transparência OAB-AL

## Overview

**Creative North Star: "Quadro Público de Prestação de Contas"**

O sistema visual herda a identidade já reconhecida no portal da OAB-AL. Ele deve se comportar como um quadro público bem organizado: institucional, direto, verificável e denso o bastante para permitir comparação sem transformar cada informação em decoração.

A reprodução é deliberadamente fiel. O valor do novo frontend está em consistência, responsividade, acessibilidade e manutenção — não em trocar a personalidade visual durante a migração.

**Key Characteristics:**

- azul institucional como estrutura e estado ativo;
- superfícies majoritariamente planas, brancas e delimitadas por borda;
- números e rótulos compactos, com hierarquia por peso e contraste;
- vermelho reservado à identidade, ícones e pequenos acentos;
- componentes repetíveis para categorias, filtros, tabelas, documentos e indicadores.

## Colors

A paleta combina azul institucional, branco e cinzas frios, com acentos controlados para ação e estados semânticos.

### Primary

- **Azul institucional:** estrutura do miolo do portal, títulos, estados ativos e navegação entre categorias.
- **Azul institucional profundo:** apoio para áreas densas e variações de contraste.

### Secondary

- **Vermelho OAB:** assinatura visual, ícones e acentos pequenos; não funciona como grande fundo decorativo.
- **Azul de ação pública:** links, downloads e ações informativas.

### Neutral

- **Superfície branca:** fundo principal e cards.
- **Cinza de estrutura:** cabeçalhos de tabela e separação de blocos.
- **Azul institucional pálido:** áreas informativas e localização.
- **Texto carvão:** leitura principal.
- **Texto cinza:** metadados, descrições e apoio.
- **Borda fria:** delimitação de tabelas, cards e controles.

**The Public Record Rule.** Cor nunca substitui rótulo, valor, legenda ou estado textual em tabelas e gráficos.

### Limite da reprodução

As capturas completas servem para localizar o conteúdo no site atual, mas somente o miolo do Portal da Transparência é contrato visual. Cabeçalho, menus globais, banners institucionais externos ao módulo, localização e rodapé do WordPress ficam fora da aplicação React.

## Typography

**Display Font:** Inter, com fallback sans-serif.
**Body Font:** Inter, com fallback sans-serif.

**Character:** tipografia neutra e condensada pela hierarquia, adequada a números, tabelas e leitura institucional. Inter é mantida por fidelidade à referência, não como escolha genérica.

### Hierarchy

- **Display** (700, 32–64px fluido, 1.02): títulos de entrada e estados de fundação; não substituir títulos densos das páginas públicas.
- **Headline** (600, 24px, 1): títulos de blocos principais.
- **Title** (500, 16px, 1.125): título institucional do portal e títulos compactos.
- **Body** (400, 14px, 1.5): parágrafos, células e descrições; textos longos devem permanecer abaixo de 80 caracteres por linha.
- **Label** (600, 13px, 1.5): cabeçalhos de tabela, filtros, rótulos e metadados relevantes.

**The Numbers First Rule.** Indicadores priorizam alinhamento, tabulação e leitura dos valores; o rótulo contextualiza sem competir.

## Layout

O conteúdo público usa um container central amplo. Em desktop, indicadores aparecem em quatro colunas e categorias em cinco colunas. Em tablet, os blocos caem para duas colunas. Em mobile, indicadores e categorias formam uma única coluna, preservando a ordem da referência.

A escala espacial principal usa 8, 12, 16, 24 e 32 pixels. Blocos densos usam 12–16 pixels internamente; divisões entre seções usam 24–32 pixels. O alinhamento é predominantemente à esquerda.

Tabelas devem preservar cabeçalhos e relações entre colunas. No mobile, usar rolagem horizontal com indicação visual ou uma transformação semântica validada por tabela; nunca omitir colunas silenciosamente.

## Elevation & Depth

O sistema é plano por padrão. Hierarquia vem de cor de fundo, borda e espaçamento. Sombras não são linguagem principal dos componentes do Portal da Transparência e ficam restritas a elementos externos já existentes no WordPress.

**The Flat Record Rule.** Cards, tabelas e filtros repousam sem sombra; interação é comunicada por borda, cor, foco e contraste.

## Shapes

Controles têm cantos discretos de 4px. Painéis e categorias usam 8px. Cards de indicadores usam 12px. Bordas são finas e frias; formas muito arredondadas ou cápsulas ficam restritas a estados que realmente funcionem como badges.

## Components

### Buttons

- **Shape:** compacto, com raio de 4–8px conforme o contexto.
- **Primary:** azul institucional com texto branco.
- **Public action:** azul de ação para links e downloads.
- **Hover / Focus:** contraste reforçado e anel de foco visível; nunca depender apenas de movimento.

### Cards / Containers

- **Corner Style:** 8px para categorias e painéis; 12px para indicadores.
- **Background:** branco, com azul institucional no estado ativo.
- **Shadow Strategy:** sem sombra em repouso.
- **Border:** borda fina em cinza frio ou azul institucional.
- **Internal Padding:** 12–16px em blocos densos.

### Inputs / Fields

- **Style:** fundo cinza muito claro, raio de 4px, altura mínima de 43px e padding lateral de 16px.
- **Focus:** borda azul institucional e foco visível externo.
- **Error / Disabled:** mensagem textual, cor semântica e contraste; desabilitado continua legível.

### Navigation

Categorias formam uma grade de cartões compactos. O estado ativo usa azul institucional com texto branco; os demais usam branco e borda fina. Os ícones permanecem vermelhos em todos os estados, inclusive no card ativo. Em mobile, a grade vira uma coluna sem reduzir a área de toque.

### Data Table

Cabeçalho em cinza estrutural, texto azul institucional de 13px/600 e padding de 12px por 16px. Células usam texto de 14px, borda fria e altura confortável para leitura.

### Metric Card

Cada indicador reúne ícone, rótulo, valor e exercício. A informação deve permanecer nessa ordem sem adicionar ações ou decoração que prejudiquem a leitura comparativa.

### Document Group

Documentos são agrupados por exercício, tipo e período. PDF, CSV e XLSX usam rótulo explícito e destino coerente com o tipo real do arquivo.

## Do's and Don'ts

### Do:

- **Do** preservar a mesma ordem de indicadores e categorias nas dez páginas.
- **Do** usar tokens semânticos para todos os valores visuais compartilhados.
- **Do** manter foco visível, área de toque adequada e estados textuais.
- **Do** representar gráficos também por legenda, rótulo e resumo acessível.
- **Do** tratar tabelas e documentos como conteúdo principal.

### Don't:

- **Don't** introduzir gradientes genéricos, glassmorphism ou sombras de SaaS.
- **Don't** transformar cada bloco em card aninhado.
- **Don't** esconder colunas ou dados no mobile sem alternativa equivalente.
- **Don't** usar cor isoladamente para indicar situação, execução ou crescimento.
- **Don't** duplicar cabeçalho e rodapé do WordPress no modo público incorporado.

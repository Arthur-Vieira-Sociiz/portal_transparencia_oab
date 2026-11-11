# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Monorepo com pnpm workspaces e Turborepo.
- React, TypeScript e Vite no frontend.
- Node.js, Express e Zod na API.
- Prisma e PostgreSQL/NeonDB no banco.
- Hospedagem principal em `transparencia.orbiapp.com.br`.

## Users

- Pessoas da sociedade e da advocacia que consultam dados públicos da OAB-AL.
- Equipe autorizada da OAB-AL que cadastra, revisa e publica dados e documentos, mesmo que a atualização ocorra apenas uma vez por ano.

## Product Purpose

Retirar o Portal da Transparência da dependência do WordPress, preservar o acesso público às informações e oferecer à OAB-AL uma área administrativa própria para manter dados e documentos sem alteração de código.

O produto é bem-sucedido quando o conteúdo interno das dez categorias públicas é reproduzido com fidelidade, funciona dentro do WordPress e pode ser atualizado com segurança pelo portal administrativo. O cabeçalho e o rodapé institucionais permanecem responsabilidade do WordPress e não fazem parte da reprodução React.

## Positioning

Uma única plataforma mantém administração e consulta pública sobre a mesma fonte de dados, reutilizando contratos e componentes sem misturar permissões ou interfaces.

## Operating Context

- A área pública é acessada diretamente ou incorporada por iframe no WordPress da OAB-AL.
- A equipe administrativa trabalha em fluxos de cadastro, upload, revisão, pré-visualização e publicação.
- Os dados são organizados principalmente por categoria e exercício.
- PDFs, CSVs e planilhas fazem parte central da prestação de contas.
- O portal atual foi construído com snippets PHP; eles serão usados como referência para campos, consultas, filtros e regras no backend novo.

## Capabilities and Constraints

- `/login` autentica usuários administrativos.
- `/admin` concentra cadastro, revisão e publicação.
- `/public` expõe somente conteúdo publicado.
- `/api` atende as duas áreas.
- O embed não duplica o cabeçalho ou o rodapé do WordPress.
- A área pública precisa de URLs estáveis para dez categorias.
- Documentos precisam de metadados, exercício, categoria, versão, status e histórico.
- Os snippets PHP são fonte de comportamento, não código a ser transplantado automaticamente.
- A primeira entrega prioriza o frontend público com fixtures tipadas.

## Brand Commitments

- Preservar a identidade institucional reconhecível da OAB-AL.
- A primeira versão pública reproduz fielmente o miolo funcional das páginas existentes, não o cabeçalho ou o rodapé globais do site.
- A fidelidade cobre títulos e conteúdos da seção, indicadores, navegação entre categorias, filtros, tabelas, documentos, gráficos e estados.
- Linguagem clara, sóbria e adequada à prestação pública de contas.

## Evidence on Hand

- Dez páginas públicas atuais listadas em `docs/AUDITORIA_PAGINAS.md`.
- Levantamento preliminar de estrutura, conteúdo e tokens em `docs/DESIGN_SYSTEM.md`.
- Snippets PHP existentes ainda precisam ser fornecidos ou localizados antes da etapa de backend.
- Os arquivos oficiais que substituirão documentos de teste ainda precisam ser inventariados pela OAB-AL.

## Product Principles

1. Publicar com rastreabilidade: nenhum dado chega ao público sem estado de publicação e histórico.
2. Compartilhar sem acoplar: contratos e componentes são reutilizados, enquanto permissões e layouts permanecem separados.
3. Tratar documentos como dados de primeira classe, não como links soltos.
4. Preservar a fidelidade pública sem carregar limitações técnicas do WordPress.
5. Manter a operação simples para atualizações esporádicas.
6. Construir páginas por composição de componentes reutilizáveis, extraídos a partir de padrões reais e não de abstrações prematuras.

## Accessibility & Inclusion

- Navegação completa por teclado.
- Foco visível, semântica adequada e contraste WCAG AA.
- Tabelas e gráficos precisam manter significado em telas pequenas e tecnologias assistivas.
- A integração deve considerar o VLibras usado no site institucional.

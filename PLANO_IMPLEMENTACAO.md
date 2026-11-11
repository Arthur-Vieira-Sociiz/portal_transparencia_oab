# Plano de implementação

## Objetivo

Construir uma plataforma única em `transparencia.orbiapp.com.br`, composta por:

- portal administrativo React em `/admin` para a equipe da OAB-AL;
- portal público React em `/public`, incorporado ao WordPress;
- API Express compartilhada;
- banco PostgreSQL;
- armazenamento de documentos.

O desenvolvimento começa pela reprodução fiel do portal público. Os contratos e componentes serão preparados para o backend e o administrativo seguintes.

> **Limite visual:** “reprodução fiel” significa o conteúdo interno das dez páginas. Cabeçalho e rodapé globais continuam no WordPress e ficam fora do frontend React.

## Etapa 0 — Decisões e baseline

- [x] Mapear as dez páginas públicas atuais.
- [x] Definir domínio e rotas principais.
- [x] Definir um único frontend React com layouts `admin` e `public`.
- [ ] Confirmar os domínios WordPress autorizados a incorporar o portal.
- [ ] Definir navegadores e dispositivos mínimos.
- [ ] Inventariar documentos e dados oficiais que substituirão os testes atuais.
- [ ] Confirmar o serviço de armazenamento de arquivos.

**Saída:** escopo técnico e operacional fechado.

## Etapa 1 — Referência visual e design system

- [x] Capturar as dez páginas em 1440 px, 768 px e 390 px.
- [x] Extrair paleta, tipografia, espaçamentos, largura máxima, bordas, sombras e ícones.
- [x] Definir comportamento responsivo de indicadores, filtros, tabelas, documentos e gráficos.
- [x] Definir os componentes que serão reutilizados no administrativo.
- [ ] Aprovar `docs/DESIGN_SYSTEM.md`.

**Saída:** contrato visual para `/public` e base compartilhada com `/admin`.

## Etapa 2 — Fundação do monorepo

- [x] Inicializar Git.
- [x] Configurar `pnpm` workspaces e Turborepo.
- [x] Criar `apps/web` com React, TypeScript e Vite.
- [x] Criar `apps/api` com Node.js, Express e TypeScript.
- [x] Criar `packages/ui`, `packages/contracts` e configuração TypeScript compartilhada.
- [x] Configurar lint, format, typecheck, build e testes.
- [x] Criar `.env.example` sem segredos.

**Saída:** comandos de desenvolvimento, build, testes e typecheck funcionando no monorepo.

## Etapa 3 — Contratos e fixtures públicas

- [x] Inventariar os seis snippets recebidos e preservar os originais fora do Git.
- [x] Criar a base Zod compartilhada para indicadores, documentos, RH, patrimônio, financeiro, contratos e quantitativos administrativos.
- [ ] Modelar com Zod indicadores, documentos, orçamento, patrimônio, contratos, RH, relatórios, glossário e LGPD.
- [ ] Criar fixtures equivalentes ao conteúdo atual.
- [x] Implementar a base da interface de repositório de dados com adapter local.
- [x] Centralizar a primeira formatação de moeda e números inteiros.
- [ ] Garantir que a futura troca para HTTP não altere as páginas.

**Saída:** frontend público funcional sem depender do backend.

## Etapa 4 — Componentes compartilhados

- [ ] Implementar tokens e componentes básicos em `packages/ui`.
- [x] Implementar o primeiro shell público, grade de indicadores e navegação por categoria.
- [ ] Implementar filtros, tabela responsiva, documentos, downloads e estados vazios.
- [ ] Implementar cards de estatística, progresso, gráficos, índice alfabético e accordion.
- [ ] Implementar estados de foco, hover, loading, erro e desabilitado.

**Saída:** biblioteca reutilizável entre `/public` e `/admin`.

## Etapa 5 — Portal público

Implementar na ordem abaixo:

1. [x] Institucional.
2. [ ] Administrativo.
3. [ ] Orçamentário.
4. [ ] Patrimonial.
5. [ ] Financeiro.
6. [ ] Recursos Humanos.
7. [ ] Contratos e Licitações.
8. [ ] Glossário.
9. [ ] LGPD.
10. [ ] Relatórios e Indicadores.

Rotas previstas:

- `/public`;
- `/public/institucional`;
- `/public/administrativo`;
- `/public/orcamentario`;
- `/public/financeiro`;
- `/public/patrimonial`;
- `/public/contratos-e-licitacoes`;
- `/public/recursos-humanos`;
- `/public/relatorios-e-indicadores`;
- `/public/glossario`;
- `/public/lgpd`.

**Saída:** réplica pública completa usando fixtures tipadas.

## Etapa 6 — Qualidade do portal público

- [ ] Testes de componentes com Vitest e Testing Library.
- [ ] Testes ponta a ponta e regressão visual com Playwright.
- [ ] Comparação das dez rotas nos três tamanhos de referência.
- [ ] Validação de teclado, foco, semântica, contraste e leitor de tela.
- [ ] Validação dos formatos e destinos dos downloads.
- [ ] Auditoria de performance e Core Web Vitals.

**Saída:** portal público aprovado antes da conexão com dados reais.

## Etapa 7 — API, banco e documentos

- [ ] Inventariar os snippets PHP por categoria e comportamento.
- [ ] Transformar regras observadas nos snippets em contratos e testes comparativos.
- [ ] Configurar Express, Prisma e NeonDB/PostgreSQL.
- [ ] Criar migrations e seed de desenvolvimento.
- [ ] Implementar endpoints públicos somente de leitura.
- [ ] Implementar endpoints administrativos protegidos.
- [ ] Integrar armazenamento de PDF, CSV e XLSX.
- [ ] Armazenar checksum, MIME type, tamanho, versão e autoria dos documentos.
- [ ] Implementar versionamento por exercício e status `rascunho`, `em_revisao`, `publicado` e `arquivado`.
- [ ] Implementar trilha de auditoria.
- [ ] Configurar cache público e invalidação após publicação.

**Saída:** fonte única de dados com publicação controlada.

## Etapa 8 — Autenticação e portal administrativo

- [ ] Implementar `/login` e recuperação segura de acesso.
- [ ] Definir perfis e permissões.
- [ ] Implementar dashboard administrativo.
- [ ] Criar formulários por módulo reutilizando contratos e componentes públicos.
- [ ] Implementar upload, substituição e validação de documentos.
- [ ] Implementar pré-visualização da página pública antes da publicação.
- [ ] Implementar revisão, publicação, arquivamento e histórico.
- [ ] Prevenir edição concorrente e submissão duplicada.

**Saída:** equipe da OAB-AL capaz de manter o portal sem alteração de código.

## Etapa 9 — Publicação e embed no WordPress

- [x] Preparar configurações Vercel para os projetos `apps/web` e `apps/api`.
- [ ] Publicar web e API em `transparencia.orbiapp.com.br` por HTTPS.
- [ ] Criar shortcode/bloco WordPress para `https://transparencia.orbiapp.com.br/public`.
- [ ] Sincronizar a altura do iframe com `postMessage` e validação de origem.
- [ ] Autorizar apenas os domínios oficiais da OAB-AL em `frame-ancestors`.
- [ ] Evitar cabeçalho, rodapé e scroll duplicados.
- [ ] Validar cookies, analytics, downloads, links externos e VLibras.
- [ ] Configurar logs, monitoramento, backup e restauração.

**Saída:** plataforma disponível para administração e consulta pública.

## Critérios de aceite

- As áreas administrativa e pública compartilham componentes e contratos sem misturar permissões ou layouts.
- `/public` funciona diretamente e dentro do WordPress.
- As dez categorias possuem URLs estáveis e responsivas.
- Somente dados publicados aparecem na área pública.
- A equipe autorizada consegue cadastrar, revisar e publicar dados e documentos.
- Toda publicação mantém histórico e autoria.
- Lint, typecheck, testes, acessibilidade e regressão visual passam no pipeline.

## Próxima ação

Continuar a Etapa 3 e iniciar a segunda composição pública: modelar os dados e
implementar a página Administrativo, reutilizando o shell, os indicadores e a
navegação criados em Institucional.

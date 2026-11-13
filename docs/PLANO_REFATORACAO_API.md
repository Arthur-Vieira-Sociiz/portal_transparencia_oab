# Plano de refatoração modular — API e frontend

## Contexto e branch

- Branch de trabalho: `refatoracao`.
- Base inicial: `main` no commit `b35c42f`.
- Objetivo: organizar API e frontend por domínio, conectar as interfaces à API e
  manter as fronteiras de persistência preparadas para uma troca futura de banco.
- Esta trilha não inclui a migração para Firebase. Essa mudança será planejada e
  executada separadamente a partir da `main`.

## Regras de execução

1. Fazer uma etapa por vez e aguardar aprovação antes da próxima.
2. Preservar URLs, status HTTP, schemas Zod e mensagens de erro existentes.
3. Manter e atualizar os testes existentes. Criar testes novos somente quando já
   autorizado pelo usuário ou após aprovação explícita.
4. Migrar um domínio por vez, incluindo API client, hooks, componentes e páginas
   públicas/administrativas relacionadas.
5. O assistente não cria commits. Cada etapa fica sem commit para revisão; o usuário
   decide quando versionar.
6. Em cada etapa executar `typecheck`, `lint`, testes existentes e uma verificação
   manual das rotas afetadas.
7. Fazer code review de padrões e aderência ao escopo antes de avançar.

## Estrutura-alvo da primeira passagem

```text
apps/api/src/
├── app.ts
├── errors/
│   ├── custom-errors.ts
│   └── error-handlers.ts
├── middlewares/
│   ├── cors.ts
│   ├── require-admin.ts
│   └── require-user.ts
└── routes/
    ├── auth/
    ├── budget/
    ├── contracts/
    ├── financial/
    ├── general-data/
    ├── health/
    ├── human-resources/
    ├── patrimonial/
    └── reports-indicators/
```

Cada módulo de rota terá, no mínimo, um arquivo `*.routes.ts` e um
`*.controller.ts`. Um `*.service.ts` local só será criado quando existir lógica
própria da camada HTTP; os services de domínio atuais permanecem onde estão nesta
passagem.

## Etapas

### Etapa 0 — Baseline e isolamento da branch

- [x] Criar a branch `refatoracao` a partir da `main`.
- [x] Confirmar que as mudanças existentes pertencem somente ao refactor.
- [x] Registrar o resultado inicial de typecheck, lint e testes existentes.

**Aceite:** trabalho isolado da `main` e baseline conhecido.

### Etapa 1 — Health

- [x] Criar `routes/health/health.controller.ts`.
- [x] Criar e exportar `routes/health/health.routes.ts`.
- [x] Registrar o módulo no `app.ts`.
- [x] Preservar `GET /api/health` e `HealthResponseSchema`.
- [x] Validar typecheck, lint, testes existentes e code review.

**Aceite:** health não possui handler no `app.ts` e mantém a mesma resposta.

### Etapa 2 — Infraestrutura HTTP compartilhada

- [x] Extrair configuração CORS para `middlewares/cors.ts`.
- [x] Extrair `requireUser` e `requireAdmin` com dependências injetadas.
- [x] Centralizar respostas de erro em `errors/error-handlers.ts`.
- [x] Consolidar ou reexportar erros em `errors/custom-errors.ts` sem duplicar
      as classes já usadas pelos services.
- [x] Garantir que o error handler continue registrado depois de todas as rotas.

**Aceite:** autenticação/autorização e tradução de erros deixam de ser funções
internas de `createApp`, sem mudança de status ou payload.

### Etapa 3 — Auth e usuários administrativos

- [x] Extrair register, login, me e logout.
- [x] Extrair listagem e criação de usuários administrativos, pois usam o mesmo
      domínio e as mesmas regras de autorização.
- [x] Injetar `AuthService` no módulo de rotas.
- [x] Preservar os contratos Zod e o status `204` do logout.

**Aceite:** o `app.ts` não contém handlers de autenticação ou usuários.

### Etapa 4 — Dados gerais

- [x] Extrair as rotas públicas e administrativas de `general-data`.
- [x] Preservar o filtro opcional por exercício e o `404` público.
- [x] Injetar `GeneralDataService` e o middleware de usuário.

**Aceite:** CRUD e publicação funcionam com os mesmos contratos e respostas.

### Etapa 5 — Relatórios e indicadores

- [x] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [x] Preservar deleção com `204` e validação por `ExerciseSchema`.

### Etapa 6 — Recursos humanos

- [x] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [x] Preservar a validação de localidade, meses e exercício.

### Etapa 7 — Orçamentário

- [x] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [x] Preservar filtros `exercise` e `informationType`.

### Etapa 8 — Financeiro

- [x] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [x] Preservar os formatos de documento e o período.

### Etapa 9 — Patrimonial

- [x] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [x] Preservar a distinção entre `status` do bem e `statusState` de publicação.

### Etapa 10 — Contratos e fornecedores

- [x] Extrair rotas públicas e administrativas de contratos.
- [x] Extrair CRUD de fornecedores no mesmo módulo.
- [x] Preservar deleções com `204`, conflitos de CNPJ e publicação por exercício.

### Etapa 11 — Limpeza do composition root

- [x] Deixar no `app.ts` apenas configuração global, criação dos singletons,
      composição de dependências, registro dos routers e error handler.
- [x] Remover imports e funções que ficaram obsoletos.
- [x] Confirmar que o `app.ts` possui no máximo 300 linhas.
- [x] Atualizar a documentação de arquitetura. As coleções Insomnia não foram
      alteradas porque URLs e payloads permaneceram iguais.

**Aceite:** todas as rotas permanecem disponíveis e `app.ts` funciona como
composition root.

## Estrutura-alvo do frontend

```text
apps/web/src/
├── components/
│   ├── ui/                         # primitivas genéricas
│   └── shared/                     # compartilhamento real entre domínios
├── features/
│   ├── public-shell/               # hero, navegação e layout público
│   ├── auth/
│   ├── general-data/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── test-fixtures/              # somente enquanto necessário
│   ├── budget/
│   ├── financial/
│   ├── human-resources/
│   ├── patrimonial/
│   ├── contracts/
│   └── reports/
└── lib/                            # utilitários sem regra de domínio
```

Regras do frontend modular:

- Hook específico fica no próprio domínio (`useBudgetPage`, por exemplo).
- Não criar `usePageData` genérico: loading, vazio e `404` possuem semântica por
  domínio e o TanStack Query já fornece o estado base.
- Um domínio não importa internamente outro domínio. O que for realmente comum
  sobe para `components/shared`, `components/ui` ou `public-shell`.
- Componentes genéricos surgem somente depois de dois usos reais compatíveis.
- Fixtures permanecem próximas do domínio e são removidas somente quando páginas e
  testes não dependerem mais delas.
- O cliente HTTP monolítico será reduzido gradualmente; cada etapa move apenas as
  funções do domínio em trabalho.

## Estrutura-alvo do backend

```text
apps/api/src/
├── app.ts                         # composition root
├── infrastructure/
│   ├── database/prisma.ts          # um cliente injetável
│   └── observability/
├── http/
│   ├── errors/
│   └── middlewares/
└── features/
    ├── auth/
    ├── general-data/
    ├── budget/
    ├── financial/
    ├── human-resources/
    ├── patrimonial/
    ├── contracts/
    └── reports/
```

Cada feature concentra routes, controller, service, interface de repository e
adapter Prisma. Services dependem da interface, nunca diretamente do Prisma. Essa
fronteira deve ser preservada para a futura implementação Firebase na `main`.

## Auditoria do backend após a primeira passagem

Já está adequado:

- `app.ts` possui 150 linhas e atua como composition root.
- Rotas e controllers estão separados por domínio.
- Helmet e CORS com whitelist estão registrados globalmente.
- Bodies principais usam contratos Zod compartilhados.
- O schema Prisma é válido e possui índices para os filtros públicos centrais.

Pendências confirmadas:

- [x] Centralizar os clientes Prisma hoje duplicados nos repositories.
- [x] Remover `any` dos mapeadores de contratos, patrimônio, RH e relatórios.
- [x] Parar de converter qualquer erro Prisma em `null`; mapear apenas erros
      esperados e propagar falhas de infraestrutura.
- [x] Usar transações nas operações de conteúdo com mais de uma escrita/leitura
      dependente. A atomicidade específica do bootstrap/sessões de autenticação
      permanece na Etapa 16.
- [ ] Validar variáveis de ambiente, params e queries com schemas Zod explícitos.
- [ ] Padronizar `404`, erro de CORS e JSON malformado como respostas JSON.
- [ ] Definir permissões reais para `ADMIN`, `EDITOR` e `REVIEWER`; hoje as
      mutações de conteúdo exigem apenas usuário autenticado.
- [ ] Adicionar rate limit em login/cadastro, logging estruturado e request ID.
- [ ] Fechar o cadastro bootstrap depois do primeiro administrador e definir a
      limpeza de sessões expiradas/revogadas.
- [ ] Adicionar paginação/limites nas listagens administrativas potencialmente
      ilimitadas.
- [ ] Separar `app.test.ts` por feature conforme o fatiamento vertical.
- [x] Confirmar que Institucional, Administrativo, Glossário e LGPD são conteúdos
      estáticos, sem CRUD ou API. Os dados locais são intencionais e não representam
      uma pendência do backend.

Decisão adiada para o plano Firebase: substituir o bearer token persistido no
browser por access token curto em memória e refresh token seguro, ou delegar todo o
fluxo ao Firebase Auth. Não implementar duas arquiteturas de sessão em sequência.

## Etapas restantes

### Etapa 12 — Dados Gerais no frontend

- [x] Usar a API real no resumo público.
- [x] Validar sucesso, loading, vazio/`404` e erro.
- [x] Remover o fallback que apresentava fixture como dado oficial.

**Aceite:** o resumo exibe somente dados publicados pela API e falhas não viram
valores oficiais fictícios.

### Etapa 13 — Infraestrutura Prisma compartilhada

- [x] Criar um único provider/cliente Prisma injetável.
- [x] Migrar repositories um por vez para receber o cliente.
- [x] Tipar todos os mapeadores sem `any`.
- [x] Substituir `catch(() => null)` por tradução seletiva de erros Prisma.
- [x] Tornar atômicas as operações dependentes de conteúdo com `$transaction`.

**Aceite:** uma instância de infraestrutura por processo, erros reais preservados e
nenhuma mudança nos contratos HTTP.

### Etapa 14 — Fatiamento vertical do backend

- [ ] Mover um domínio por vez para `features/<domínio>`.
- [ ] Manter interface de repository ao lado do service e adapter Prisma isolado.
- [ ] Mover os testes de cada domínio para perto da feature.
- [ ] Atualizar apenas imports em cada subetapa.

**Aceite:** cada feature concentra routes, controller, service, repository e testes,
sem dependências circulares ou acesso direto ao Prisma pelo controller.

### Etapa 15 — Bordas HTTP e validação

- [ ] Criar schemas compartilhados para IDs, params, queries e paginação.
- [ ] Validar todas as variáveis de ambiente na inicialização.
- [ ] Padronizar erros de validação, rota inexistente, CORS e JSON malformado.
- [ ] Preservar mensagens e status já consumidos pelo frontend.

### Etapa 16 — Autorização e proteção operacional

- [ ] Definir uma matriz de permissões para `ADMIN`, `EDITOR` e `REVIEWER` antes de
      alterar guards.
- [ ] Aplicar RBAC nas mutações e publicações de cada módulo.
- [ ] Adicionar rate limit nas rotas de autenticação.
- [ ] Encerrar o bootstrap público após o primeiro administrador.
- [ ] Adicionar logging estruturado, request ID e sanitização de dados sensíveis.
- [ ] Definir limpeza de sessões expiradas e revogadas.

### Etapa 17 — Paginação, desempenho e fechamento do backend

- [ ] Adicionar limites/paginação nas listagens que podem crescer sem limite.
- [ ] Revisar queries, `select`, índices e transações com dados representativos.
- [ ] Revisar integridade entre fornecedores e contratos antes de alterar o schema.
- [ ] Executar typecheck, lint, testes e build da API.
- [ ] Verificar manualmente os endpoints e atualizar a documentação do backend.

**Aceite:** todas as pendências confirmadas do backend estão concluídas ou
explicitamente destinadas ao plano Firebase.

### Etapa 18 — Base modular do frontend e piloto Dados Gerais

- [ ] Criar `public-shell` e mover somente os componentes estruturais públicos.
- [ ] Criar o módulo `general-data` com API, hook, componentes e consumidores.
- [ ] Definir query keys no módulo e manter funções de query estáveis.
- [ ] Atualizar imports e rotas sem mudança visual ou de contrato.

**Aceite:** Dados Gerais demonstra a estrutura que os outros domínios seguirão,
sem dependência lateral e sem abstração genérica prematura.

### Etapa 19 — Módulo Orçamentário

- [ ] Mover API, hooks, página pública, página administrativa e testes do
      domínio.
- [ ] Remover o acesso direto ao cliente HTTP/repository antigo nesse módulo.
- [ ] Preservar filtros, documentos e estados de loading/vazio/erro.

**Aceite:** Orçamentário funciona de ponta a ponta dentro da própria feature.

### Etapa 20 — Módulo Financeiro

- [ ] Migrar API, hooks, páginas pública/administrativa e testes.
- [ ] Extrair componentes internos de documento e accordion somente dentro do
      módulo.
- [ ] Preservar exercício, período e formatos de download.

### Etapa 21 — Módulo Recursos Humanos

- [ ] Migrar API, hooks, páginas pública/administrativa e testes.
- [ ] Manter meses/localidades como conceitos do domínio, sem componente genérico
      conhecer essa regra.
- [ ] Remover a dependência de fixture em produção.

### Etapa 22 — Módulo Patrimonial

- [ ] Migrar API, hooks, páginas pública/administrativa e testes.
- [ ] Preservar a diferença entre situação do bem e status de publicação.
- [ ] Manter filtros e documentos dentro do domínio.

### Etapa 23 — Módulo Contratos e Fornecedores

- [ ] Migrar API, hooks, páginas pública/administrativa e testes.
- [ ] Manter contratos e fornecedores na mesma feature, com componentes internos
      separados.
- [ ] Preservar CNPJ, aditivos, documentos e publicação por exercício.

### Etapa 24 — Módulo Relatórios e Indicadores

- [ ] Migrar API, hook, páginas e testes.
- [ ] Dividir a página pública em seções e componentes de gráfico do próprio
      módulo.
- [ ] Manter o carregamento dinâmico de Chart.js e evitar aumentar o bundle inicial.
- [ ] Preservar seleção do exercício mais recente e todos os indicadores.

### Etapa 25 — Módulos frontend dos conteúdos estáticos

- [ ] Migrar Institucional, Administrativo, Glossário e LGPD para seus módulos sem
      criar CRUD ou API.
- [ ] Renomear fixtures usadas em produção para conteúdo estático tipado, deixando
      claro que são a fonte oficial dessas telas.
- [ ] Preservar textos, embeds, acessibilidade e navegação atuais.

### Etapa 26 — Limpeza dos adaptadores temporários

- [ ] Remover `localPublicTransparencyRepository` quando não houver consumidores.
- [ ] Esvaziar o `apps/web/src/lib/api.ts`, movendo as funções restantes para os
      respectivos módulos.
- [ ] Remover fixtures e exports mortos somente após busca de referências.
- [ ] Atualizar router e documentação da arquitetura.

### Etapa 27 — Componentes compartilhados comprovados

- [ ] Inventariar repetições depois da migração dos módulos.
- [ ] Promover para `components/shared` ou `components/ui` somente componentes com
      pelo menos dois usos realmente equivalentes.
- [ ] Avaliar `DocumentLink`, estados de página e selects antes de generalizar.
- [ ] Não criar DataTable genérica se colunas e comportamentos ainda divergirem.

### Etapa 28 — Desempenho e dependências do frontend

- [ ] Medir bundle do frontend e manter Chart.js fora do carregamento inicial.
- [ ] Revisar re-renderizações e waterfalls somente com evidência de medição.
- [ ] Executar auditoria de dependências sem atualizar versões no mesmo diff.

### Etapa 29 — Validação e encerramento da branch

- [ ] Executar typecheck, lint, testes e build de todos os workspaces.
- [ ] Testar manualmente os endpoints e fluxos públicos/administrativos.
- [ ] Confirmar que não restam fixtures servindo como dados oficiais.
- [ ] Confirmar que Prisma está isolado atrás das interfaces de repository.
- [ ] Fazer code review final de padrões, escopo, segurança e regressões.
- [ ] Registrar o que ficar deliberadamente para a migração Firebase na `main`.

## Checklist obrigatório por etapa

- [ ] Diff restrito ao escopo aprovado.
- [ ] Typecheck e lint do workspace afetado passam.
- [ ] Testes existentes do workspace afetado passam.
- [ ] Build é executado quando a etapa altera código de produção.
- [ ] Rotas ou fluxos afetados são verificados manualmente.
- [ ] Code review não possui achado bloqueante.
- [ ] Aprovação antes da etapa seguinte.

## Próxima ação

As Etapas 12 e 13 estão concluídas. Depois da revisão do usuário, iniciar somente
a Etapa 14, movendo um domínio por vez para a estrutura vertical do backend.

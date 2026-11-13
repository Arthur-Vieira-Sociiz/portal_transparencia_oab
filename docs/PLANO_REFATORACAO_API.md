# Plano de refatoração da API

## Contexto e branch

- Branch de trabalho: `refatoracao`.
- Base inicial: `main` no commit `b35c42f`.
- Objetivo: reduzir o `apps/api/src/app.ts`, organizar a API por módulos e, depois,
  conectar o frontend à API sem alterar o comportamento público.
- Esta trilha não inclui a migração para Firebase. Essa mudança será planejada e
  executada separadamente a partir da `main`.

## Regras de execução

1. Fazer uma etapa por vez e aguardar aprovação antes da próxima.
2. Preservar URLs, status HTTP, schemas Zod e mensagens de erro existentes.
3. Não criar testes automatizados sem solicitação. Os testes existentes podem ser
   executados para detectar regressões.
4. Não mover services e repositories na primeira passagem de modularização.
5. Um commit por etapa aprovada, com diff pequeno e reversível.
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

- [ ] Extrair as rotas públicas e administrativas de `general-data`.
- [ ] Preservar o filtro opcional por exercício e o `404` público.
- [ ] Injetar `GeneralDataService` e o middleware de usuário.

**Aceite:** CRUD e publicação funcionam com os mesmos contratos e respostas.

### Etapa 5 — Relatórios e indicadores

- [ ] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [ ] Preservar deleção com `204` e validação por `ExerciseSchema`.

### Etapa 6 — Recursos humanos

- [ ] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [ ] Preservar a validação de localidade, meses e exercício.

### Etapa 7 — Orçamentário

- [ ] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [ ] Preservar filtros `exercise` e `informationType`.

### Etapa 8 — Financeiro

- [ ] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [ ] Preservar os formatos de documento e o período.

### Etapa 9 — Patrimonial

- [ ] Extrair rotas públicas, CRUD administrativo e publicação por exercício.
- [ ] Preservar a distinção entre `status` do bem e `statusState` de publicação.

### Etapa 10 — Contratos e fornecedores

- [ ] Extrair rotas públicas e administrativas de contratos.
- [ ] Extrair CRUD de fornecedores no mesmo módulo.
- [ ] Preservar deleções com `204`, conflitos de CNPJ e publicação por exercício.

### Etapa 11 — Limpeza do composition root

- [ ] Deixar no `app.ts` apenas configuração global, criação dos singletons,
      composição de dependências, registro dos routers e error handler.
- [ ] Remover imports e funções que ficaram obsoletos.
- [ ] Confirmar que o `app.ts` possui no máximo 300 linhas.
- [ ] Atualizar documentação de arquitetura e coleções Insomnia afetadas.

**Aceite:** todas as rotas permanecem disponíveis e `app.ts` funciona como
composition root.

### Etapa 12 — Frontend conectado à API

- [ ] Implementar chamadas reais em `apps/web/src/lib/api.ts`.
- [ ] Migrar primeiro Dados Gerais e validar estados de loading, vazio e erro.
- [ ] Migrar, uma por vez, as páginas de orçamento, financeiro, RH, patrimônio,
      contratos e relatórios.
- [ ] Remover fixtures somente depois que nenhuma página ou teste depender delas.

**Aceite:** módulos públicos usam a API real sem regressão visual ou funcional.

### Etapa 13 — Fatiamento vertical

- [ ] Mover service e repository de um domínio por vez para `features/<domínio>`.
- [ ] Manter interfaces de repository para permitir troca de persistência.
- [ ] Atualizar imports sem misturar essa mudança com alteração de comportamento.

**Aceite:** cada feature concentra controller, rotas, service e repository sem
dependências circulares.

### Etapa 14 — Redução de duplicação

- [ ] Inventariar padrões repetidos somente após todos os módulos estarem estáveis.
- [ ] Extrair helpers de CRUD/publicação apenas quando as variações forem conhecidas.
- [ ] Evitar abstrações que escondam schemas, autorização ou status HTTP.

**Aceite:** menos duplicação sem perder legibilidade ou comportamento específico.

## Checklist obrigatório por etapa

- [ ] Diff restrito ao escopo aprovado.
- [ ] `pnpm --filter @oab-transparencia/api typecheck` passa.
- [ ] `pnpm --filter @oab-transparencia/api lint` não adiciona erros.
- [ ] Testes existentes passam; nenhum teste novo é criado automaticamente.
- [ ] Rotas afetadas são verificadas manualmente.
- [ ] Code review não possui achado bloqueante.
- [ ] Aprovação antes da etapa seguinte.

## Próxima ação

Revisar e aprovar a Etapa 1. Depois, iniciar somente a Etapa 2.

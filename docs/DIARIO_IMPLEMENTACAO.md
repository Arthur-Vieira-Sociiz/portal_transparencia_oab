# Diário de implementação e aprendizado

## 2026-11-11 — Fundação do monorepo

### Objetivo

Criar a estrutura mínima para desenvolver frontend público, administrativo, API e pacotes compartilhados no mesmo repositório.

### Decisões

- pnpm gerencia dependências e workspaces.
- Turborepo coordena tarefas.
- React/Vite serve `/public` e `/admin` na mesma aplicação.
- Express implementa a API.
- Zod em `packages/contracts` é a fonte dos formatos compartilhados.
- `tsx` executa a API durante o desenvolvimento porque o Node local 22.14 ainda não possui o suporte nativo de TypeScript exigido pela documentação atual do Express.

### Conceitos para revisar

- diferença entre dependência e dependência de desenvolvimento;
- scripts do `package.json`;
- `workspace:*` e `--filter`;
- diferença entre typecheck, teste e execução;
- diferença entre pnpm e Turborepo.

### Verificação

Etapa concluída com os seguintes comandos executados a partir da raiz:

```powershell
git init -b main
pnpm init
pnpm create vite apps/web --template react-ts --no-interactive
pnpm add -D -w turbo prettier typescript oxlint vitest
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

O prefixo `-D` instala uma dependência usada apenas no desenvolvimento. `-w`
autoriza a instalação na raiz do workspace. Dependências específicas de uma
aplicação foram instaladas com `pnpm --filter <pacote> add <dependência>`.

Resultados finais:

- typecheck: quatro pacotes verificados;
- lint: quatro pacotes, sem erros ou avisos;
- testes: contratos, API e frontend aprovados;
- build: API compilada com TypeScript e frontend empacotado pelo Vite;
- revisão manual: `/admin` validado em 1440 × 900 e 390 × 844;
- integração: `/api/health` retornou o contrato compartilhado esperado.

### Problemas reais e aprendizados

#### Script de instalação bloqueado pelo pnpm

O pnpm bloqueou inicialmente o script nativo do `esbuild`. Isso é uma proteção
contra execução automática de código de dependências. Depois de confirmar o
pacote, executamos `pnpm approve-builds esbuild`; a autorização explícita ficou
registrada em `pnpm-workspace.yaml`.

#### jsdom incompatível com a versão local do Node

O primeiro ambiente de testes do frontend, `jsdom`, acionou uma incompatibilidade
indireta no Node 22.14. Substituímos por `happy-dom`, que oferece o DOM simulado
necessário para os testes de componentes desta etapa.

#### Dependência transitiva ausente no teste da API

O encadeamento usado por `supertest` não encontrou `@noble/hashes` no ambiente
atual. A dependência foi declarada explicitamente em `apps/api` para tornar o
ambiente de teste reproduzível. Antes de atualizar as bibliotecas no futuro,
devemos verificar se esse contorno ainda é necessário.

### Leitura arquitetural da estrutura

O frontend e a API não importam código um do outro. Ambos importam
`@oab-transparencia/contracts`, que contém o schema Zod e o tipo do endpoint de
saúde. Assim, o formato é validado em tempo de execução e também conhecido pelo
TypeScript. Esse é o primeiro exemplo concreto de compartilhamento sem acoplamento
entre as aplicações.

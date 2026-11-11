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

## 2026-11-11 — Snippets, contratos e Vercel

### Decisão de deploy

O monorepo será conectado a dois projetos Vercel: `apps/web` como aplicação Vite
e `apps/api` como aplicação Express. Separar os projetos mantém logs, previews e
variáveis independentes, mas ambos continuam usando o mesmo repositório e os
mesmos contratos.

O frontend recebe `VITE_API_URL`, que é incorporada ao bundle e deve conter apenas
o endereço público da API. A API recebe `WEB_ORIGIN` e, futuramente,
`DATABASE_URL`; essas variáveis não são expostas ao navegador.

### Tradução dos snippets para contratos

Seis snippets foram preservados na pasta bruta ignorada pelo Git. Em vez de copiar
os campos ACF, criamos schemas de domínio para documentos, indicadores, recursos
humanos, patrimônio, financeiro, contratos e quantitativos administrativos.

O tipo TypeScript nasce do schema com `z.infer`. Assim, não mantemos uma interface
e uma validação separadas que poderiam divergir.

### Problema encontrado na validação

O primeiro typecheck falhou porque a API usa resolução ESM estrita e os exports
relativos do pacote de contratos não tinham a extensão `.js`. Depois da correção,
criamos também subcaminhos como `@oab-transparencia/contracts/health`. Isso evita
que o frontend carregue schemas que não usa e devolveu o bundle ao tamanho
anterior.

### Falha do primeiro deploy da API

O build do Turborepo passou na Vercel, mas o adaptador Express fez uma segunda
transpiração da Function. O `tsconfig.json` de runtime listava explicitamente
`vitest/globals` e `node`; nessa etapa isolada, a Vercel não resolveu esses tipos
pelos mesmos links do workspace local.

Removemos a lista explícita. Os tipos de Node agora são descobertos pela presença
de `@types/node`, e os testes importam suas funções diretamente do Vitest. Também
declaramos `WEB_ORIGIN`, `VITE_API_URL` e `DATABASE_URL` no ambiente da tarefa de
build do Turborepo, eliminando o aviso de variáveis omitidas do cache.

### Falha de runtime após o build da API

O deploy seguinte compilou, mas a Function tentou carregar
`@oab-transparencia/contracts/src/health.ts`. O pacote compartilhado ainda usava
exports source-first também para execução. A Vercel instalou o workspace, porém o
arquivo TypeScript fonte não entrou no bundle final da Function.

O pacote de contratos agora possui build próprio em `dist`, mantém o código fonte
somente para resolução de tipos e aponta os exports de runtime para JavaScript
compilado. O Turborepo constrói dependências antes da API e inicia um watcher dos
contratos durante o desenvolvimento.

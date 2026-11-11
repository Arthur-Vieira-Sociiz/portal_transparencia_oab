# Guia de desenvolvimento

Este documento ensina a reconstruir a fundação do projeto e serve como referência diária de comandos.

## Modelo mental

Um monorepo contém vários projetos JavaScript no mesmo repositório:

- **aplicações** são executáveis: `apps/web` e `apps/api`;
- **pacotes** são peças reutilizáveis: `packages/contracts` e `packages/ui`;
- **pnpm** instala dependências e conecta os workspaces;
- **Turborepo** coordena scripts entre os workspaces;
- **package.json** descreve cada projeto e seus scripts;
- **pnpm-workspace.yaml** informa ao pnpm onde estão os projetos;
- **turbo.json** informa a ordem, o cache e os resultados das tarefas.

## npm, pnpm e npx/pnpm dlx

`npm` e `pnpm` resolvem o mesmo problema: instalar pacotes e executar scripts. Este projeto usa pnpm porque ele é eficiente e possui suporte forte a monorepos.

| Intenção                                 | npm                     | pnpm usado aqui                  |
| ---------------------------------------- | ----------------------- | -------------------------------- |
| instalar tudo                            | `npm install`           | `pnpm install`                   |
| adicionar dependência                    | `npm install zod`       | `pnpm add zod`                   |
| adicionar dependência de desenvolvimento | `npm install -D vitest` | `pnpm add -D vitest`             |
| executar script                          | `npm run dev`           | `pnpm dev`                       |
| executar gerador temporário              | `npx create-vite`       | `pnpm create vite` ou `pnpm dlx` |

### Dependência normal ou de desenvolvimento?

- `dependencies`: necessária quando o programa executa, como React, Express ou Zod.
- `devDependencies`: necessária para construir, testar ou analisar, como TypeScript, Vitest, ESLint e Turbo.

O sinal `-D` é a forma curta de `--save-dev`.

## Comandos estruturais desta etapa

### Inicializar o Git

```powershell
git init -b main
```

- `init` cria o repositório local.
- `-b main` define o nome da primeira branch.
- Isso não publica nada na internet.

### Criar um package.json

```powershell
pnpm init
```

O `package.json` da raiz identifica o monorepo, guarda scripts globais e fixa a versão do pnpm.

### Criar o frontend Vite

```powershell
pnpm create vite apps/web --template react-ts --no-interactive
```

- `create vite` executa o gerador oficial.
- `apps/web` é o destino.
- `--template react-ts` escolhe React com TypeScript.
- `--no-interactive` evita perguntas no terminal e torna o comando reproduzível.

### Adicionar uma dependência na raiz

```powershell
pnpm add -D -w turbo typescript prettier
```

- `-D` registra ferramentas de desenvolvimento.
- `-w` significa _workspace root_: a dependência pertence à raiz, não a uma aplicação.

### Adicionar dependência a uma aplicação

```powershell
pnpm --filter @oab-transparencia/api add express
```

`--filter` seleciona um workspace pelo nome. Sem ele, você pode instalar o pacote no lugar errado.

### Referenciar pacote local

```json
{
  "dependencies": {
    "@oab-transparencia/contracts": "workspace:*"
  }
}
```

`workspace:*` obriga o pnpm a usar o pacote deste monorepo. Ele falha em vez de baixar acidentalmente outro pacote com o mesmo nome.

## Comandos diários

```powershell
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm format
```

- `dev`: mantém web e API rodando durante o desenvolvimento.
- `build`: gera artefatos de produção.
- `typecheck`: verifica tipos sem executar o programa.
- `lint`: encontra padrões perigosos ou inconsistentes.
- `test`: executa testes automatizados.
- `format`: normaliza a formatação dos arquivos.

Para executar somente um workspace:

```powershell
pnpm --filter @oab-transparencia/web dev
pnpm --filter @oab-transparencia/api test
```

## Como ler um script

Exemplo do `package.json` raiz:

```json
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

Ao executar `pnpm build`, o pnpm encontra o texto `turbo run build`. O Turbo procura um script chamado `build` em cada workspace, respeita as dependências e aproveita cache quando possível.

## TypeScript compartilhado

`packages/contracts` será a fonte única dos formatos trocados entre frontend e backend:

```ts
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
```

O schema existe durante a execução e valida dados reais. O tipo existe durante o desenvolvimento e ajuda o editor/compilador. Ambos nascem da mesma declaração, evitando divergência.

## Verificação da fundação

Uma fundação saudável precisa passar nestes comandos:

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Se todos terminarem com código de saída `0`, a estrutura está consistente.

## Fontes oficiais

- [Vite — Getting Started](https://vite.dev/guide/)
- [pnpm — Workspaces](https://pnpm.io/workspaces/)
- [Turborepo — Add to an existing repository](https://turborepo.com/docs/getting-started/add-to-existing-repository)
- [Turborepo — Structuring a repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)
- [Express 5 — Installing](https://expressjs.com/en/5x/starter/installing/)

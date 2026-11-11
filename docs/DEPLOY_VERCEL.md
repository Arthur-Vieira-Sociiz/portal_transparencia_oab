# Deploy na Vercel

## Estratégia

O mesmo repositório será conectado a dois projetos Vercel:

| Projeto sugerido               | Root Directory | Framework | Responsabilidade               |
| ------------------------------ | -------------- | --------- | ------------------------------ |
| `portal-transparencia-oab-web` | `apps/web`     | Vite      | `/public`, `/admin` e `/login` |
| `portal-transparencia-oab-api` | `apps/api`     | Express   | `/api/*`                       |

Essa separação mantém previews e logs independentes sem dividir o código em dois
repositórios. Os dois projetos continuam consumindo `packages/contracts` pelo
workspace pnpm.

## Ordem do primeiro deploy

1. Importar o repositório no projeto da API e selecionar `apps/api` como raiz.
2. Publicar a API e testar `https://URL-DA-API/api/health`.
3. Criar o projeto web com raiz `apps/web`.
4. Configurar `VITE_API_URL=https://URL-DA-API/api` no projeto web.
5. Configurar `WEB_ORIGIN=https://URL-DO-WEB` no projeto da API.
6. Fazer novo deploy dos dois projetos após alterar as variáveis.
7. Validar diretamente `/public/institucional`, `/admin` e `/api/health`.

## Variáveis

### Projeto web

```text
VITE_API_URL=https://URL-DA-API/api
```

Variáveis iniciadas por `VITE_` entram no bundle do navegador. Portanto, essa
variável pode conter somente o endereço público da API, nunca credenciais.

### Projeto API

```text
WEB_ORIGIN=https://URL-DO-WEB
DATABASE_URL=postgresql://...
```

`DATABASE_URL` será necessária quando o banco for integrado. Ela deve existir
somente no projeto da API.

## Domínios finais previstos

- web: `https://transparencia.orbiapp.com.br`;
- API: domínio temporário da Vercel e, posteriormente,
  `https://transparencia-api.orbiapp.com.br` ou outro subdomínio aprovado.

Se for obrigatório manter a API sob `transparencia.orbiapp.com.br/api`, será
necessário configurar um proxy/rewrite entre os projetos após os domínios finais
serem definidos.

## Acompanhamento

Cada push para `main` gera produção. Branches e pull requests geram previews.
Antes de promover uma entrega, validar:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Depois do deploy, acompanhar Build Logs, Function Logs e a rota `/api/health` no
dashboard da Vercel.

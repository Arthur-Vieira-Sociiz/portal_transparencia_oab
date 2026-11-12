# Autenticação administrativa

O primeiro acesso ao painel será criado pela API. O banco guarda usuários,
hashes de senha e sessões revogáveis; nunca guarda senhas em texto puro.

## Configurar localmente

No PowerShell, na raiz do repositório:

```powershell
Copy-Item apps\api\.env.example apps\api\.env
```

Abra o arquivo `apps/api/.env` e preencha, sem enviar o arquivo ao Git:

```dotenv
# URL direta do Neon: usada apenas nas migrations.
DATABASE_URL="..."

# URL com -pooler: usada pela API/Vercel para atender requisições.
DATABASE_URL_POOLED="..."

# Crie uma senha longa e aleatória para autorizar o cadastro inicial.
ADMIN_REGISTRATION_KEY="..."
```

`DATABASE_URL` e `DATABASE_URL_POOLED` apontam para o mesmo banco. A primeira
é direta e adequada para alterar o schema; a segunda usa pool de conexões e é
adequada para a API serverless.

> [!note]
> O arquivo da API fica em `apps/api/.env`. O `.env.example` da raiz contém
> apenas variáveis públicas do frontend.

## Criar as tabelas

```powershell
pnpm --filter @oab-transparencia/api db:migrate
```

Esse comando aplica a migration versionada em
`apps/api/prisma/migrations/20261111174000_add_auth` e cria as tabelas `User`
e `Session`.

## Rodar a API

```powershell
pnpm --filter @oab-transparencia/api dev
```

## Testar no Insomnia

Importe o arquivo
`docs/insomnia/portal-transparencia-auth.insomnia.json` pelo menu **Import** do
Insomnia. Na coleção, preencha o ambiente com a `registration_key` definida no
`.env` e, após cadastro ou login, copie o `token` retornado para
`access_token`.

A pasta **Casos de erro** já cobre chave inválida (`403`), payload inválido
(`400`), senha incorreta (`401`) e chamada sem token (`401`). Cada novo módulo
do backend terá sua própria coleção ou grupo de requests com exemplos de
sucesso e erro antes de ser considerado concluído.

## Endpoints iniciais

| Método | Rota                 | Uso                                                                                      |
| ------ | -------------------- | ---------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/register` | Cria a primeira conta como `ADMIN`; as próximas são `EDITOR`. Exige a chave de cadastro. |
| `POST` | `/api/auth/login`    | Retorna uma sessão com token temporário.                                                 |
| `GET`  | `/api/auth/me`       | Confere a sessão enviada em `Authorization: Bearer <token>`.                             |
| `POST` | `/api/auth/logout`   | Revoga a sessão atual.                                                                   |

## Primeiro CRUD: Dados Gerais

O módulo mantém um registro por exercício com os oito valores dos cards da
página Institucional. O fluxo é: preencher → salvar rascunho → conferir prévia
→ publicar.

| Método  | Rota                                     | Uso                               |
| ------- | ---------------------------------------- | --------------------------------- |
| `GET`   | `/api/admin/general-data`                | Lista rascunhos e publicados.     |
| `POST`  | `/api/admin/general-data`                | Cria um exercício como `DRAFT`.   |
| `PATCH` | `/api/admin/general-data/:id`            | Atualiza um registro.             |
| `POST`  | `/api/admin/general-data/:id/publish`    | Publica o exercício.              |
| `GET`   | `/api/public/general-data?exercise=2026` | Retorna somente dados publicados. |

Importe `docs/insomnia/portal-transparencia-general-data.insomnia.json` para
testar sucesso, duplicidade (`409`), payload inválido (`400`), sem autenticação
(`401`) e ID inexistente (`404`).

> [!warning]
> O endpoint de cadastro não deve ficar disponível sem
> `ADMIN_REGISTRATION_KEY`. Em produção, configure todas as variáveis no painel
> da Vercel — não em arquivos versionados.

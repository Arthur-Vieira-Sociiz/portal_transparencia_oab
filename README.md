# Portal da Transparência OAB-AL

Monorepo do Portal da Transparência da OAB-AL.

## Produto

Uma única plataforma hospedada em `transparencia.orbiapp.com.br`:

- área administrativa autenticada em `/admin`, usada pela equipe da OAB-AL para alimentar e publicar dados;
- área pública em `/public`, incorporada ao WordPress por iframe;
- API compartilhada pelas duas áreas;
- banco PostgreSQL como fonte única dos dados publicados.

O primeiro ciclo de desenvolvimento será dedicado à reprodução fiel das páginas públicas atuais. A API, o banco e o portal administrativo entram nos ciclos seguintes, sem exigir reescrita da interface pública.

## Documentação

- [Plano de implementação](./PLANO_IMPLEMENTACAO.md)
- [Arquitetura](./docs/ARQUITETURA.md)
- [Auditoria das páginas atuais](./docs/AUDITORIA_PAGINAS.md)
- [Design system](./docs/DESIGN_SYSTEM.md)
- [Referência do backend PHP e documentos](./docs/REFERENCIA_BACKEND_PHP.md)
- [Contexto durável do produto](./PRODUCT.md)
- [Guia de desenvolvimento e comandos](./docs/GUIA_DESENVOLVIMENTO.md)
- [Diário de implementação e aprendizado](./docs/DIARIO_IMPLEMENTACAO.md)
- [Inventário dos snippets PHP](./docs/INVENTARIO_SNIPPETS.md)
- [Deploy na Vercel](./docs/DEPLOY_VERCEL.md)

## Estado atual

Etapa 2 concluída e Etapas 3–5 em andamento: Git, workspace pnpm, Turborepo,
React/Vite, API Express e pacotes compartilhados estão inicializados. A primeira
página pública, `/public/institucional`, já usa contratos Zod, fixture validada,
repositório local e componentes reutilizáveis. Web e API estão preparados para
projetos separados na Vercel.

## Primeiros comandos

```powershell
pnpm install       # instala as dependências de todos os workspaces
pnpm dev           # inicia frontend e API em modo de desenvolvimento
pnpm typecheck     # verifica os tipos TypeScript sem executar o sistema
pnpm lint          # procura problemas estáticos no código
pnpm test          # executa os testes automatizados
pnpm build         # produz os artefatos de produção
```

Leia [Guia de desenvolvimento](./docs/GUIA_DESENVOLVIMENTO.md) antes de alterar
a fundação. Ele explica o que cada comando faz e como recriar esta estrutura do
zero.

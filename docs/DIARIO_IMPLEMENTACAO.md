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

## 2026-11-11 — Primeiro recorte público: Institucional

### Limite visual confirmado

O frontend React reproduz somente o miolo mostrado na referência: começa no
banner azul “Portal da Transparência” e inclui indicadores, categorias e o
conteúdo da seção. Cabeçalho, menus globais e rodapé continuam sendo
responsabilidade do WordPress.

### Fluxo de dados implementado

```text
fixture → validação Zod → repositório local → React Query → componentes → página
```

Esse fluxo evita ligar os componentes diretamente a objetos estáticos. Quando a
API estiver pronta, a implementação local do repositório poderá ser trocada por
HTTP sem mudar a composição visual da página.

Foram criados os contratos `PublicSummarySchema` e
`PublicInstitutionalPageSchema`, a fixture institucional, os formatadores de
moeda e número e os componentes reutilizáveis de banner, indicadores, ícones e
navegação por categoria.

### Conceito: `satisfies` e `parse`

A fixture usa `satisfies PublicInstitutionalPage` para receber feedback do
TypeScript durante a escrita e `PublicInstitutionalPageSchema.parse(...)` para
validar o objeto também em tempo de execução. TypeScript desaparece depois do
build; Zod continua protegendo a fronteira quando os dados vierem de JSON ou da
API.

### Comando útil por workspace

```powershell
pnpm --filter @oab-transparencia/web dev
```

`--filter` seleciona somente o workspace informado. É útil quando se quer
trabalhar apenas no frontend, sem iniciar a API e os outros pacotes.

### Verificação

- `pnpm typecheck`: aprovado;
- `pnpm lint`: aprovado, sem avisos;
- `pnpm test`: 9 testes aprovados;
- `pnpm build`: aprovado;
- comparação visual manual da rota `/public/institucional`: aprovada em desktop;
- comportamento responsivo definido para 820 px, 520 px e 360 px.

### Refinamento após comparação com o portal original

A primeira captura local revelou que a escala tipográfica tinha sido estimada a
partir de uma imagem reduzida. A inspeção do CSS publicado mostrou os valores
reais: 13 px nos rótulos dos indicadores, 17 px nos valores, 11 px no exercício,
16 px nos títulos e 14 px/20 px no conteúdo.

Também substituímos os desenhos aproximados das categorias pelos dez arquivos de
ícone usados no WordPress. Os indicadores mantêm SVG inline, agora com os mesmos
paths do portal original. A fonte Inter passou a ser empacotada localmente com
`@fontsource/inter`, evitando depender das fontes disponíveis no computador da
pessoa que acessa o iframe.

O comando usado para adicionar uma dependência apenas ao frontend foi:

```powershell
pnpm --filter @oab-transparencia/web add @fontsource/inter
```

Aqui, `--filter` seleciona o workspace e `add` registra a dependência no
`package.json` desse aplicativo, atualizando também o lockfile da raiz.

## 2026-11-11 — Segunda página pública: Administrativo

### Reutilização comprovada

Depois da segunda página, o padrão repetido deixou de ser uma hipótese. Banner,
indicadores e navegação por categorias foram extraídos para
`PublicPortalLayout`. Institucional e Administrativo agora fornecem somente seu
conteúdo específico como `children`.

### Conteúdo específico

A página Administrativo possui:

- fixture validada por `PublicAdministrativePageSchema`;
- descrição e link do organograma 2025–2027;
- botão acessível que abre o PDF oficial em nova aba;
- iframe de 800 px apontando para `https://oab-transparencia.netlify.app`.

O WordPress atual usa a tag de iframe e o shortcode `[wpcode id="125193"]`. O
React não executa shortcodes WordPress; ele reproduz somente a tag HTML do iframe.
O domínio externo respondeu HTTP 200 e não enviou `X-Frame-Options` nem uma
política CSP que bloqueie a incorporação.

> **Dependência temporária:** o quantitativo administrativo ainda é renderizado
> pelo projeto Netlify. Quando essa funcionalidade migrar para a API nova, o
> iframe poderá ser substituído sem alterar o shell compartilhado.

### HTML e JSX

No HTML, o estilo aparece como texto:

```html
style="border:none;"
```

No React/JSX, `style` recebe um objeto JavaScript:

```tsx
style={{ border: 'none' }}
```

As duas formas produzem a mesma declaração CSS no navegador.

### Verificação

- rota `/public/administrativo` criada;
- estado ativo da categoria confirmado;
- endpoint do iframe respondeu e permite incorporação;
- typecheck, lint, testes e build aprovados;
- 12 testes aprovados no monorepo;
- comparação visual desktop executada;
- correção compartilhada aplicada aos rótulos longos em telas estreitas.

## 2026-11-11 — Terceira página pública: Orçamentário

### O que foi construído

A rota `/public/orcamentario` agora usa o mesmo `PublicPortalLayout` de
Institucional e Administrativo. Após conferir a implementação WordPress atual,
a página foi ajustada para reproduzir sua estrutura: filtros de exercício e tipo
de informação, tabela horizontal, badge de execução e atalho de visualização do
PDF.

Os dois registros de demonstração foram espelhados da página consultada em
2026-11-11: orçamento anual de R$ 14,5 milhões e execuções de 87,2% e 95,5%.
Eles permanecem na fixture local, não são uma fonte oficial do novo portal e
serão substituídos pelos registros publicados no painel administrativo.

### Conceito: composição sobre contrato

O componente visual não recebe um objeto solto. O repositório retorna um dado que
passa por `BudgetTransparencySchema` antes de chegar ao React. Quando a API for
conectada, trocaremos somente o adapter do repositório. A página continuará
conhecendo apenas o contrato `BudgetTransparency`.

Para executar apenas o frontend durante o desenvolvimento:

```powershell
pnpm --filter @oab-transparencia/web dev
```

Para validar o workspace depois de uma alteração:

```powershell
pnpm --filter @oab-transparencia/web lint
pnpm --filter @oab-transparencia/web test
pnpm --filter @oab-transparencia/web build
```

## 2026-11-11 — Quarta página pública: Financeiro

### Estrutura encontrada no portal atual

A página Financeiro possui filtros de exercício e tipo de informação. Seus
resultados aparecem em quatro blocos expansíveis: Balancetes, Demonstrativos
Financeiros, Quadro Sintético de Receitas e Quadro Sintético de Despesas. Cada
linha pode disponibilizar um ou dois documentos para download.

### Implementação reutilizável

Foi criado `PublicFinancialPageSchema`, que agrupa vários exercícios e seus
respectivos `FinancialTransparency`. Cada item de documento segue o contrato
compartilhado de formato, URL e exercício. Isso permite que a futura área
administrativa cadastre a mesma estrutura que o portal público renderiza.

O estado do accordion é controlado com `useState`, enquanto o filtro apenas
deriva a lista exibida a partir dos dados já carregados; não há nova requisição a
cada troca de filtro enquanto usamos fixtures locais.

### Dados iniciais

Foram incluídos mocks alinhados ao conteúdo exibido hoje para 2026: quatro
balancetes trimestrais, quatro demonstrativos trimestrais, um relatório de
receitas e um de despesas. Os links são temporários e serão substituídos pelo
armazenamento de documentos do novo portal.

## 2026-11-11 — Quinta página pública: Patrimonial

### Estrutura implementada

O portal atual organiza a área Patrimonial em uma tabela com filtros por ano,
tipo de bem e situação. A nova rota `/public/patrimonial` reproduz essa estrutura
com rolagem horizontal em telas estreitas, badges de situação e estado vazio.

O contrato `PublicPatrimonialPageSchema` agrupa os exercícios e os bens. Cada
bem tem identificação, tipo, descrição, localização, valor de aquisição,
situação, exercício e documento opcional. Esse é o mesmo conjunto de campos que
o formulário administrativo deverá cadastrar depois.

### Mocks

Foram adicionados três bens de demonstração para exercitar os filtros: imóvel
ativo, mobiliário locado e equipamentos emprestados. Eles são estritamente dados
de desenvolvimento; não representam o patrimônio real da OAB/AL.

## 2026-11-11 — Sexta página pública: Recursos Humanos

### Estrutura encontrada no portal atual

A área de Recursos Humanos filtra por ano e localidade e apresenta os doze meses
do exercício. Cada competência disponibiliza arquivos para consulta.

### Contrato e interface

`PublicHumanResourcesPageSchema` agrupa exercícios e registros de RH. Cada
registro exige exatamente doze competências únicas — uma regra que já existia em
`HumanResourcesRecordSchema` e evita duplicidade ou meses faltando no futuro
admin.

A página `/public/recursos-humanos` reproduz os filtros, o cabeçalho da sede, a
lista mensal e os downloads. Foram criados dados de desenvolvimento para
Jacarecica (2026) e Maceió Centro (2025), exclusivamente para exercitar os
estados de filtro e a futura publicação.

## 2026-11-11 — Sétima página pública: Contratos e Licitações

### Estrutura encontrada no portal atual

A página combina busca textual, filtros de ano e fornecedor, e uma grade de
cards. Cada card reúne fornecedor, CNPJ, objeto, data, vigência, valor, contrato
principal e aditivos. A fonte atual lista fornecedores, mas responde com estado
vazio para os filtros consultados.

### Contrato preparado para o admin

`ContractRecordSchema` passou a exigir `objectDescription` e `signedAt`, além de
fornecedor, CNPJ, vigência, valor, exercício, documento principal e aditivos.
`PublicContractsPageSchema` agrupa os exercícios e contratos publicados.

Foram criados dois registros de desenvolvimento para exercitar pesquisa, filtro
por exercício e exibição de aditivo. Eles são mocks e não representam contratos
reais da OAB/AL.

### Ajuste de fidelidade visual

A composição pública foi revisada contra a referência do WordPress: título e
descrição sem acentuação, busca apenas com sublinhado, filtros compactos e card
de 410px. O card mostra exclusivamente os campos que aparecem na referência
(fornecedor, CNPJ, vigência, valor e aditivo); `objectDescription` e `signedAt`
continuam no contrato compartilhado para o formulário administrativo futuro,
mas não são inventados na tela pública.

## 2026-11-11 — Oitava página pública: Glossário

### Referência e interação

A página atual foi consultada diretamente para preservar seu conteúdo e a sua
composição: título, texto introdutório, índice alfabético de A a Z e painel de
termos por letra. As abas podem ser acionadas por clique e pelo teclado com as
setas, Home e End.

### Contrato compartilhado

`GlossaryEntrySchema` valida cada termo e sua definição, enquanto
`PublicGlossaryPageSchema` concentra a introdução e a coleção completa. A página
deriva o agrupamento alfabético no React; assim, o admin futuro cadastra apenas
termo e definição, sem precisar manter listas por letra manualmente.

## 2026-11-11 — Nona página pública: LGPD

### Estrutura encontrada no portal atual

A página LGPD reúne dois parágrafos introdutórios, uma política de privacidade
em accordion e dois grupos adicionais sobre cookies. A primeira seção de cada
grupo é iniciada aberta, como na referência.

### Contrato e atualização futura

`PublicLgpdPageSchema` organiza os parágrafos e grupos de seções, e cada
`LgpdSectionSchema` separa título e conteúdo. O painel administrativo poderá
atualizar seções ou grupos individualmente, mantendo a interface pública e sua
ordem sem código específico por tópico.

## 2026-11-11 — Décima página pública: Relatórios e Indicadores

O dashboard PHP fornecido foi traduzido para `PublicReportsPageSchema`, usando
o histórico de `GeneralIndicators` por exercício. A página inclui filtros,
indicadores financeiros e orçamentários, progresso, indicadores administrativos,
contratos, recursos humanos e gráficos visuais leves sem depender de CDN.

### Revisão de fidelidade dos gráficos

Os gráficos de demonstração foram substituídos por Chart.js: barras agrupadas
para comparativos, linhas para tendências e área preenchida para o valor total
contratado. Com isso, as legendas, escalas e tooltips no hover passam a se
comportar como no dashboard de referência. A biblioteca é importada apenas ao
montar cada gráfico, preservando o carregamento inicial da página pública.

## 2026-11-11 — Base de autenticação administrativa

Foi criada a primeira migration Prisma para `User` e `Session`, além dos
contratos Zod e endpoints de cadastro, login, consulta de sessão e logout. As
senhas são derivadas com `scrypt`; apenas o hash da sessão é persistido no
banco. O cadastro exige `ADMIN_REGISTRATION_KEY` do ambiente: a primeira conta
é `ADMIN` e as posteriores recebem `EDITOR` até que o painel de permissões seja
concluído.

A conexão direta do Neon fica reservada à migration, enquanto a URL com pool é
usada pela API. O guia operacional está em `docs/AUTENTICACAO.md`.

### Interface inicial de login

O frontend passou a usar Tailwind CSS 4 com o plugin oficial do Vite e
componentes locais do shadcn/ui. A rota `/login` consome a API de autenticação,
exibe erros de credenciais e salva a sessão apenas na aba atual; `/admin` é uma
área temporária protegida para confirmar login e logout antes dos CRUDes.

## 2026-11-12 — Primeiro CRUD administrativo: Dados Gerais

O primeiro módulo operacional do painel permite cadastrar os oito indicadores
da home por exercício: receitas, despesas, orçamento, patrimônio, advogados,
sociedades, salas de apoio e inscritos. O formulário usa Tailwind e componentes
shadcn/ui, com pré-visualização lado a lado para o operador conferir o resultado
antes de publicar.

Cada exercício é único e começa como `DRAFT`. O endpoint público filtra por
`PUBLISHED`, então salvar não altera a área pública. A autoria de criação e
atualização fica relacionada ao usuário autenticado no banco.

Foi aplicada no Neon a migration
`apps/api/prisma/migrations/20261112120000_add_general_data`. Os testes cobrem
publicação, consulta pública, duplicidade de exercício e chamada sem
autenticação. O fluxo manual está documentado na coleção
`docs/insomnia/portal-transparencia-general-data.insomnia.json`.

## 2026-11-12 — Shell administrativo e navegação por módulos

O painel administrativo deixou de ser uma tela isolada e passou a usar um shell
com menu lateral no desktop, navegação horizontal no celular, identificação do
usuário, atalho para a tela pública e encerramento de sessão. O menu já reúne as
dez áreas que serão alimentadas pela equipe da OAB-AL.

`Dados gerais` continua sendo o primeiro módulo funcional. As demais rotas estão
organizadas com uma tela de transição, mantendo a mesma experiência enquanto os
formulários específicos baseados nos snippets PHP são implementados.

### Refinamento visual do painel

Os ícones do menu e da prévia usam o acento vermelho da identidade pública para
facilitar o reconhecimento das categorias. O formulário passou a comunicar
sucesso, aviso, erro e informação por toasts acessíveis, sem deslocar o layout
com mensagens inline. O componente de toast é compartilhado e baseado em
Tailwind/shadcn, com fechamento manual, leitura por tecnologias assistivas e
desaparecimento automático.

### Ajuste de operação e viewport

Os campos numéricos agora aceitam a digitação no padrão brasileiro e formatam
milhares e casas decimais ao sair do campo, mantendo o valor numérico correto
para a API. A área administrativa usa `100dvh`, rolagem independente do
conteúdo e área inferior fixa na sidebar, garantindo que o botão de sair não
seja perdido em telas menores. A sidebar fica reservada à navegação; o logout
passou a ficar no header, alinhado com a marca institucional.

Os campos numéricos também passaram a aplicar a máscara durante a digitação:
milhares são agrupados progressivamente e casas decimais seguem o padrão
brasileiro. O teclado bloqueia letras e a colagem passa por sanitização antes
de atualizar o valor enviado ao backend.

### Dados Gerais sem fixture de valores

Os valores históricos que apareciam nos cards públicos foram removidos. A
Institucional consulta `GET /api/public/general-data` e usa apenas um estado
vazio com zeros quando ainda não existe publicação (ou quando o ambiente local
está sem a API). Assim, nenhum valor mockado é confundido com dado oficial.

### Dados Gerais como componente único

`PublicPortalLayout` passou a consultar o endpoint de Dados Gerais e renderizar
`SummaryGrid` uma única vez para todas as páginas públicas. As páginas de
Institucional, Administrativo, Financeiro, Orçamentário, Patrimonial, Contratos,
Recursos Humanos, Glossário, LGPD e Relatórios não enviam mais um resumo próprio
nem alteram o exercício dos cards. O CRUD publicado agora é a única fonte dos
indicadores repetidos no portal.

### Regra para os próximos CRUDs

Quando um módulo tiver seu primeiro registro publicado, os valores mockados
daquela categoria devem ser removidos da página pública no mesmo passo. A tela
passa a consultar somente o endpoint público; na ausência de publicação, usa
apenas um estado vazio explicitamente neutro. Nenhum fixture de demonstração
deve permanecer como fallback de dados oficiais.

Em seguida, as ações operacionais foram reposicionadas no header alinhado à
marca da sidebar: usuário, acesso à tela pública e logout ficam no mesmo eixo
superior, enquanto a lateral permanece exclusiva para navegação dos módulos. O
logout é representado apenas pelo ícone, com `aria-label`, tooltip nativo e
separador visual entre o usuário e o link público.

O header foi refinado para uma faixa compacta de 88px, alinhada ao topo da
marca da sidebar. A descrição continua disponível para acessibilidade, mas a
faixa visual prioriza eyebrow, título e ações operacionais.

O botão `Limpar formulário` fica junto das ações de salvar e publicar, deixando
claro que ele afeta apenas o formulário atual e os valores ainda não salvos.
Antes de limpar, o admin solicita confirmação em modal. A publicação também
exige confirmação e apresenta os oito cards da prévia com os valores atuais,
para que o operador revise o conteúdo antes de torná-lo público.

O link `Ver tela pública` do `AdminShell` acompanha o módulo administrativo
aberto e leva à rota pública correspondente. Em Dados gerais, o destino é
Institucional, pois os indicadores compõem a página inicial.

### Módulo de acesso: Usuários

O shell exibe `Usuários` somente para perfis `ADMIN`. O cadastro tem nome,
e-mail, perfil e senha, com gerador de senha aleatória. Após cadastrar, um
modal exibe e-mail e senha separadamente, cada um com botão de copiar, sem
expor a senha novamente na listagem. A API devolve a senha temporária apenas
nessa resposta de criação e armazena somente o hash.

### CRUD Orçamentário

O módulo Orçamentário passou a cadastrar tipo de informação, exercício,
orçamento anual, valor previsto, valor executado e metadados opcionais do
documento. O percentual de execução é calculado pela API, os registros começam
como rascunho e a publicação ocorre por exercício. A página pública consulta
somente registros publicados, sem manter valores mockados como fonte oficial.


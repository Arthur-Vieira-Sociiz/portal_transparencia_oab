# Plano de migração do Prisma/Neon para Cloud Firestore

**Status:** em andamento
**Última atualização:** 2026-11-16
**Progresso:** Etapa 1 funcional concluída; 1 pendência externa de segurança
**Etapa atual:** Etapa 1, aguardando publicação das regras do Firestore

## Decisão adotada

Migrar somente a persistência da API:

- sair do PostgreSQL/Neon e do Prisma;
- usar Cloud Firestore no projeto Firebase da empresa;
- manter Express, autenticação própria, contratos Zod e frontend atuais;
- manter PDFs, CSVs e planilhas no armazenamento atual, sem Cloud Storage;
- não migrar dados, porque o banco Neon ainda é de desenvolvimento.

O Firebase Authentication e o Storage não fazem parte deste trabalho. O frontend continuará acessando apenas a API Express e não receberá o SDK do Firebase.

> Este documento substitui o plano anterior, que previa Firebase Authentication, Cloud Storage, ambiente de homologação, dual-write e cutover de produção. Como ainda não há produção nem dados relevantes, esse processo maior não se justifica.

## Regras de acompanhamento

- Marcar `[x]` somente depois de concluir e validar o item.
- Marcar a etapa como concluída apenas após typecheck, lint, build, code review e aceite manual.
- Registrar cada avanço na seção **Histórico de avanços**.
- Não criar testes automatizados nesta migração; a validação funcional será manual, conforme as regras do projeto.
- Manter o Neon disponível até a Etapa 6, mas não criar fallback, dual-write ou leitura híbrida.

## Arquitetura-alvo

```text
React
  │ HTTP atual, sem mudanças de contrato
  ▼
Express
  ├── autenticação própria atual
  ├── controllers e services atuais
  ├── repositories Firestore
  └── Firebase Admin SDK
           │
           ▼
      Cloud Firestore
```

O Admin SDK será usado exclusivamente no backend. O Firestore ficará fechado para acesso direto do navegador; autorização e RBAC continuam sob responsabilidade da API.

## Configuração do Firebase

A configuração web fornecida (`apiKey`, `authDomain`, `storageBucket` etc.) não é uma credencial administrativa e não será usada na API.

Variáveis necessárias no backend:

```env
FIREBASE_PROJECT_ID=transparencia-oab-al
FIREBASE_CLIENT_EMAIL=conta-de-servico@transparencia-oab-al.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCHAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
```

- A chave privada fica somente em `apps/api/.env` e nas variáveis protegidas da Vercel.
- O JSON da conta de serviço nunca será commitado nem enviado por chat.
- `DATABASE_URL` e `DATABASE_URL_POOLED` continuam necessárias durante a transição.
- A conta de serviço deve ter somente a permissão necessária para ler e escrever no Firestore.

### Configuração inicial do projeto

1. No console do Firebase, abrir **Firestore Database** e criar o banco no modo
   **Native**. A região deve ser escolhida antes da criação e não é facilmente
   alterada depois.
2. No Google Cloud, criar uma conta de serviço dedicada para a API e conceder a
   ela o papel **Cloud Datastore User**, suficiente para ler e escrever no
   Firestore.
3. Gerar uma chave JSON para essa conta e copiar os campos `project_id`,
   `client_email` e `private_key` para as três variáveis de `apps/api/.env`.
4. Confirmar que `apps/api/.env` continua ignorado pelo Git.
5. Autenticar e publicar as regras e os índices:

```bash
pnpm dlx firebase-tools login
pnpm dlx firebase-tools deploy --project transparencia-oab-al --only firestore:rules,firestore:indexes
```

A criação dos índices pode levar alguns minutos. A API ainda falhará ao iniciar
enquanto as três variáveis Firebase não estiverem configuradas.

## Modelo de coleções

| Modelo atual           | Coleção Firestore    | Estratégia de unicidade                                      |
| ---------------------- | -------------------- | ------------------------------------------------------------ |
| `User`                 | `users`              | ID estável + reserva por e-mail normalizado                   |
| `Session`              | `sessions`           | `tokenHash` como ID do documento                              |
| `RateLimitCounter`     | `rateLimitCounters`  | chave qualificada como ID                                     |
| `GeneralData`          | `generalData`        | reserva por exercício                                         |
| `ReportsIndicator`     | `reportsIndicators`  | reserva por exercício                                         |
| `BudgetRecord`         | `budgetRecords`      | reserva por exercício + tipo de informação                    |
| `FinancialDocument`    | `financialDocuments` | reserva por exercício + período + tipo de informação          |
| `HumanResourcesRecord` | `humanResources`     | reserva por exercício + localidade                            |
| `PatrimonialAsset`     | `patrimonialAssets`  | reserva por exercício + tipo + descrição                      |
| `Supplier`             | `suppliers`          | reserva por CNPJ                                              |
| `ContractRecord`       | `contracts`          | reserva por fornecedor + data de assinatura + exercício       |
| Controle interno       | `uniqueKeys`         | documento por chave única, criado dentro de transação         |
| Controle interno       | `internal`           | controle do primeiro administrador e metadados operacionais   |

### Convenções de persistência

- O ID do documento será gerado pelo Firestore e devolvido como `id`; ele não muda em edições.
- Unicidade será garantida por transação e documento de reserva em `uniqueKeys`, nunca por consulta seguida de escrita.
- Dinheiro será salvo como inteiro em centavos, com sufixo `Cents` no campo interno.
- A conversão para reais acontece somente nos repositories, preservando os números esperados pelos contratos atuais.
- Valores monetários dos contratos mantêm o limite e a escala do antigo `Decimal(14,2)`: até duas casas decimais e máximo de `999.999.999.999,99`.
- Datas serão salvas como `Timestamp` e devolvidas em ISO 8601.
- Campos opcionais vazios serão omitidos; nenhum `undefined` será enviado ao Firestore.
- Arrays como `months` e `amendmentUrls` serão armazenados como arrays nativos.
- Paginação administrativa continuará usando `page` e `limit`, com `count()` e `offset()`. Não haverá mudança para cursor nesta migração.
- Publicação por exercício usará um único `WriteBatch` de até 500 escritas. Acima disso, a operação falhará de forma explícita para não gerar publicação parcial silenciosa.
- Regras do Firestore serão deny-by-default e versionadas.
- Índices compostos serão versionados em `firestore.indexes.json`.

## Visão das etapas

- [ ] Etapa 1 — Fundação Firebase e Dados Gerais _(implementação e teste concluídos; regras ainda não publicadas)_
- [ ] Etapa 2 — Usuários, sessões e rate limit
- [ ] Etapa 3 — Relatórios, Orçamentário e Patrimonial
- [ ] Etapa 4 — Recursos Humanos e Financeiro
- [ ] Etapa 5 — Fornecedores e Contratos
- [ ] Etapa 6 — Remoção do Prisma e atualização operacional

---

## Etapa 1 — Fundação Firebase e Dados Gerais

**Estimativa:** até 2 horas
**Status:** implementação, conexão e aceite funcional concluídos; aguardando publicação das regras
**Dependência:** acesso administrativo ao projeto Firebase da empresa.
**Situação atual:** a conexão com o Firestore e o fluxo HTTP de Dados Gerais foram validados. A conta de serviço atual não tem permissão para publicar as regras pelo Firebase CLI.

### Requisitos externos

- [x] Confirmar que o Cloud Firestore existe no projeto `transparencia-oab-al`.
- [ ] Confirmar a região definitiva do banco no console.
- [x] Criar uma conta de serviço para a API.
- [ ] Conceder à conta de serviço somente a permissão necessária no Firestore.
- [x] Gerar a chave da conta de serviço e configurar as variáveis no `apps/api/.env`.
- [x] Confirmar que nenhuma credencial foi adicionada ao Git.
- [ ] Revogar a chave que foi exposta em conversa e substituir pela chave definitiva.

### Implementação

- [x] Adicionar `firebase-admin` às dependências da API.
- [x] Criar `infrastructure/database/firestore.ts` com inicialização singleton e tratamento de ambiente.
- [x] Validar `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` com Zod.
- [x] Manter a validação de `DATABASE_URL` durante a transição.
- [x] Criar conversores compartilhados para `Timestamp`, centavos e campos opcionais.
- [x] Criar helper transacional de unicidade usando `uniqueKeys`.
- [x] Mapear erros seletivamente, sem transformar qualquer falha do Firestore em `null`.
- [x] Criar `firebase.json`, `.firebaserc`, `firestore.rules` e `firestore.indexes.json`.
- [x] Implementar `firestore-general-data-repository.ts`.
- [x] Trocar somente Dados Gerais para Firestore no `app.ts`.
- [x] Manter os demais módulos no Prisma durante esta etapa.
- [x] Validar typecheck, lint, build e formatação dos arquivos alterados.
- [x] Executar code review de padrões e de escopo e corrigir os achados.
- [x] Ajustar a validação monetária para a escala e o limite do `Decimal(14,2)`.
- [x] Confirmar que o cliente Firestore não exige `DATABASE_URL`.
- [x] Reforçar o `.gitignore` contra arquivos locais de conta de serviço.
- [x] Validar a conexão do Admin SDK com o Firestore.
- [x] Validar criação, duplicidade, edição, publicação e leitura pública pelos endpoints HTTP.
- [x] Confirmar que os documentos de diagnóstico foram removidos.
- [x] Eliminar a necessidade de índice composto na consulta pública de Dados Gerais.
- [ ] Aplicar as regras do Firestore com uma conta que tenha permissão de deploy.
- [ ] Revogar a chave exposta e validar novamente com a chave definitiva.

### Aceite manual

- [x] Criar um rascunho de Dados Gerais.
- [x] Editar o mesmo registro mantendo o ID.
- [x] Impedir dois registros para o mesmo exercício, inclusive em tentativas repetidas.
- [x] Publicar e consultar pela rota pública.
- [x] Confirmar que a resposta HTTP e o formato dos campos não mudaram.
- [x] Confirmar que a coleção e as reservas de unicidade foram criadas automaticamente.
- [x] Confirmar que nenhum documento de diagnóstico permaneceu no banco.

---

## Etapa 2 — Usuários, sessões e rate limit

**Estimativa:** até 2 horas
**Status:** não iniciada
**Dependência:** Etapa 1 concluída.

### Implementação

- [ ] Criar `firestore-auth-repository.ts`.
- [ ] Criar `firestore-auth-service.ts` reutilizando `createAuthService`.
- [ ] Preservar o hash de senha e o formato atual dos tokens.
- [ ] Criar reserva transacional por e-mail normalizado.
- [ ] Criar sessões com `tokenHash` como ID.
- [ ] Buscar sessão e usuário separadamente, já que o Firestore não possui join.
- [ ] Manter expiração, revogação, status e bloqueio temporário.
- [ ] Criar controle transacional que permita somente o primeiro administrador pelo cadastro público.
- [ ] Criar `firestore-rate-limit-store.ts`.
- [ ] Migrar limpeza, incremento e decremento de contadores.
- [ ] Trocar autenticação e rate limit no `app.ts`.
- [ ] Garantir que conflitos de e-mail continuem retornando o erro HTTP atual.

### Aceite manual

- [ ] Criar o primeiro administrador no banco novo.
- [ ] Impedir um segundo cadastro inicial.
- [ ] Fazer login, consultar usuário autenticado e logout.
- [ ] Criar usuários com os três perfis.
- [ ] Rejeitar e-mail duplicado.
- [ ] Validar permissões de `ADMIN`, `EDITOR` e `REVIEWER`.
- [ ] Validar rate limit, bloqueio e revogação de sessões.

---

## Etapa 3 — Relatórios, Orçamentário e Patrimonial

**Estimativa:** até 2 horas
**Status:** não iniciada
**Dependência:** Etapa 1 concluída.

### Implementação

- [ ] Criar `firestore-reports-indicators-repository.ts`.
- [ ] Manter os cálculos de resultado e percentual de execução no service/repository atual.
- [ ] Criar `firestore-budget-repository.ts`.
- [ ] Criar `firestore-patrimonial-asset-repository.ts`.
- [ ] Implementar unicidade por exercício nos indicadores.
- [ ] Implementar unicidade por exercício + tipo no orçamento.
- [ ] Implementar unicidade por exercício + tipo + descrição no patrimonial.
- [ ] Preservar filtros, ordenações e listagens de publicados.
- [ ] Publicar exercícios com `WriteBatch` e limite explícito de 500 documentos.
- [ ] Adicionar os índices compostos necessários.
- [ ] Trocar os três repositories no `app.ts`.

### Aceite manual

- [ ] CRUD dos três módulos.
- [ ] Duplicidades rejeitadas.
- [ ] Indicadores calculados corretamente.
- [ ] Publicação por exercício.
- [ ] Listagens administrativas e públicas com ordem e formato atuais.
- [ ] Metadados e URLs de documentos preservados.

---

## Etapa 4 — Recursos Humanos e Financeiro

**Estimativa:** até 2 horas
**Status:** não iniciada
**Dependência:** Etapa 1 concluída.

### Implementação

- [ ] Criar `firestore-human-resources-repository.ts`.
- [ ] Criar `firestore-financial-document-repository.ts`.
- [ ] Preservar os doze meses e os documentos PDF/XLSX de RH.
- [ ] Preservar documentos PDF/CSV do Financeiro.
- [ ] Implementar unicidade de RH por exercício + localidade.
- [ ] Implementar unicidade financeira por exercício + período + tipo.
- [ ] Implementar paginação com `count()` e `offset()` sem alterar `page`/`limit`.
- [ ] Preservar filtros, ordenações e listagens públicas.
- [ ] Publicar exercícios com `WriteBatch` e limite explícito de 500 documentos.
- [ ] Adicionar os índices compostos necessários.
- [ ] Trocar os dois repositories no `app.ts`.

### Aceite manual

- [ ] RH com os doze meses e URLs corretas.
- [ ] Conflitos de RH e Financeiro retornando os erros esperados.
- [ ] Paginação e totais corretos.
- [ ] Publicação por exercício.
- [ ] Página pública de RH e Financeiro com o mesmo formato.
- [ ] Documentos continuam abrindo pelas URLs atuais.

---

## Etapa 5 — Fornecedores e Contratos

**Estimativa:** até 2 horas
**Status:** não iniciada
**Dependência:** Etapas 1 e 3 concluídas.

### Implementação

- [ ] Criar `firestore-contract-repository.ts`.
- [ ] Implementar fornecedor com ID estável e reserva transacional por CNPJ.
- [ ] Implementar unicidade de contrato por fornecedor + assinatura + exercício.
- [ ] Atualizar `supplierName` e `cnpj` dos contratos quando o fornecedor mudar.
- [ ] Substituir a foreign key por verificação de contratos antes de excluir fornecedor.
- [ ] Preservar `contractDocumentUrl` e `amendmentUrls`.
- [ ] Preservar listagem, paginação e publicação.
- [ ] Tratar criação e edição dentro de transações, com todas as leituras antes das escritas.
- [ ] Adicionar os índices compostos necessários.
- [ ] Trocar o repository no `app.ts`.

### Aceite manual

- [ ] Cadastro e edição de fornecedores e contratos.
- [ ] CNPJ duplicado rejeitado.
- [ ] Contrato duplicado rejeitado.
- [ ] Alteração do fornecedor refletida nos contratos.
- [ ] Fornecedor em uso não pode ser excluído.
- [ ] Aditivos e documento do contrato preservados.
- [ ] Publicação e consulta pública corretas.

---

## Etapa 6 — Remoção do Prisma e atualização operacional

**Estimativa:** 1 hora
**Status:** não iniciada
**Dependência:** Etapas 1 a 5 aceitas.

### Implementação

- [ ] Remover `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg` e `@types/pg`.
- [ ] Remover scripts `prisma generate` e `db:migrate`.
- [ ] Remover adapters Prisma, cliente gerado, schema, migrations e `verify-migration-environment.ts`.
- [ ] Remover `DATABASE_URL`, `DATABASE_URL_POOLED` e `DIRECT_DATABASE_URL` do código, exemplos e `turbo.json`.
- [ ] Remover entradas de Prisma do `.gitignore` e `pnpm-workspace.yaml`.
- [ ] Atualizar os scripts de build e typecheck.
- [ ] Configurar as variáveis Firebase na Vercel.
- [ ] Atualizar `README.md`, `PRODUCT.md` e documentos atuais de arquitetura, autenticação, desenvolvimento e deploy.
- [ ] Confirmar que não restam referências ativas ao Prisma no código da aplicação.
- [ ] Rodar typecheck, lint e build completos.
- [ ] Executar code review final.

### Aceite manual

- [ ] Fluxo público completo funcionando.
- [ ] Login, criação de usuário, permissões e logout funcionando.
- [ ] CRUD e publicação dos sete módulos funcionando.
- [ ] API iniciando apenas com as variáveis Firebase.
- [ ] Neon podendo ser desligado sem quebrar a aplicação.

---

## Critérios finais

- [ ] Nenhum arquivo ou service de domínio acessa o Firestore diretamente fora dos repositories.
- [ ] Controllers, services, contratos HTTP e frontend permanecem desacoplados da persistência.
- [ ] Todas as restrições únicas atuais continuam efetivas sob concorrência.
- [ ] Apenas registros publicados aparecem nas rotas públicas.
- [ ] Valores monetários, datas, autoria e publicação mantêm o comportamento atual.
- [ ] RBAC, rate limit e revogação de sessões continuam funcionando.
- [ ] Firestore está fechado para acesso direto do cliente.
- [ ] Índices e regras estão versionados.
- [ ] A aplicação não depende mais do NeonDB ou do Prisma.

## Estratégia de retorno durante o desenvolvimento

- O histórico do Git mantém os adapters Prisma enquanto a migração não termina.
- O Neon permanece disponível, sem alterações destrutivas, até a Etapa 6.
- Como não há produção, não haverá dual-write, feature flag ou sincronização entre bancos.
- Se uma etapa falhar, ela será corrigida antes de seguir para a próxima.

## Histórico de avanços

| Data       | Etapa       | Registro                                                                 |
| ---------- | ----------- | ------------------------------------------------------------------------ |
| 2026-11-16 | Planejamento | Escopo reduzido para Firestore, autenticação própria e sem migração de dados. |
| 2026-11-16 | Planejamento | Plano consolidado e criado neste arquivo. |
| 2026-11-16 | Etapa 1 | Fundação Firebase, configurações, regras, índices e adapter de Dados Gerais implementados. |
| 2026-11-16 | Etapa 1 | Typecheck, lint, build e formatação da API aprovados. O typecheck global ainda falha em testes antigos do `apps/web`, sem relação com esta etapa. |
| 2026-11-16 | Etapa 1 | Code review de padrões e escopo concluído; conflito de exercício corrigido para 409 e helpers sem uso removidos. |
| 2026-11-16 | Etapa 1 | Contrato monetário alinhado ao `Decimal(14,2)` e `pnpm audit --prod` sem vulnerabilidades conhecidas. |
| 2026-11-16 | Etapa 1 | `environment.test.ts` existente ajustado para a validação transitória; nenhum teste novo foi criado. |
| 2026-11-16 | Etapa 1 | Bloqueio identificado: a configuração web recebida não contém credencial administrativa nem acesso ao console. |
| 2026-11-16 | Etapa 1 | Credenciais do Firebase Admin configuradas localmente em `apps/api/.env`, sem versionamento. |
| 2026-11-16 | Etapa 1 | A chave privada foi exposta em conversa e deve ser revogada após a validação; nenhuma credencial foi adicionada ao repositório. |
| 2026-11-16 | Etapa 1 | Conexão Admin validada: Firestore acessível e coleções iniciais vazias. |
| 2026-11-16 | Etapa 1 | Fluxo HTTP validado: criação 201, duplicidade 409, edição com ID estável, publicação 200 e leitura pública 200. |
| 2026-11-16 | Etapa 1 | Documentos e reservas de diagnóstico removidos; banco confirmado sem resíduos. |
| 2026-11-16 | Etapa 1 | Índice composto removido do desenho; a consulta pública filtra o pequeno conjunto publicado em memória. |
| 2026-11-16 | Etapa 1 | Deploy de regras bloqueado por 403: a conta de serviço não possui permissão para administrar regras/índices. |

## Próxima ação

Pedir a uma conta com permissão no projeto para executar `firestore:rules` ou liberar acesso de deploy. Em paralelo, após confirmação, iniciar a Etapa 2 (usuários, sessões e rate limit). A chave exposta deve ser revogada e substituída antes do uso em produção.

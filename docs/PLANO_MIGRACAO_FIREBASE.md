# Plano de migração para Firebase

## Contexto e trilha

- Branch-base: `main`.
- Estado atual: API Express, Prisma e PostgreSQL/Neon.
- Objetivo: migrar autenticação, persistência e documentos para serviços Firebase
  sem alterar os contratos HTTP consumidos pelo frontend.
- Este plano é independente da branch `refatoracao` e não deve incorporar o
  refactor antes de uma decisão explícita de merge.

## Decisão obrigatória antes da implementação

“Firebase” pode representar duas arquiteturas diferentes:

1. **Cloud Firestore:** banco NoSQL orientado a documentos. É a hipótese principal
   deste plano e exige remodelagem, novos índices e tratamento explícito de
   unicidade e valores monetários.
2. **Firebase SQL Connect:** camada Firebase sobre PostgreSQL gerenciado no Cloud
   SQL. Preserva melhor o modelo relacional atual e deve ser escolhido se relações,
   constraints SQL ou consultas relacionais forem requisitos dominantes.

Antes de implementar, criar um spike curto com Dados Gerais e Contratos nas duas
opções e registrar uma ADR com custo, complexidade, latência, operação, lock-in e
facilidade de migração. Se a opção escolhida for Data Connect, revisar este plano
antes de seguir as etapas específicas de Firestore.

## Arquitetura-alvo assumida

```text
React
  │ Firebase Authentication (login e ID token)
  ▼
Express /api
  ├── Firebase Admin SDK: valida token e autorização
  ├── repositories: Cloud Firestore
  └── documentos: Cloud Storage for Firebase
```

Na primeira migração o frontend não acessará Firestore diretamente. A API Express
permanece como fronteira de autorização e compatibilidade, e os schemas Zod de
`packages/contracts` continuam sendo os contratos de entrada e saída. Isso permite
trocar repositories por módulo e voltar ao PostgreSQL sem reescrever as páginas.

## Regras de segurança e dados

- Usar projetos Firebase separados para desenvolvimento, homologação e produção.
- Nunca expor credenciais do Admin SDK no frontend ou no Git.
- Validar ID tokens no backend e autorizar perfis `ADMIN`, `EDITOR` e `REVIEWER`.
- Manter Firestore e Storage bloqueados por padrão; regras ficam versionadas.
- Lembrar que o Admin SDK ignora Firestore Security Rules: a API deve aplicar
  autorização mesmo com regras corretas.
- Armazenar dinheiro como inteiro em centavos. Firestore não substitui o
  `Decimal(14,2)` do PostgreSQL com a mesma semântica.
- Usar timestamps do servidor e preservar `createdById`, `updatedById`,
  `publishedAt`, status e trilha de auditoria.
- Não confiar em leitura seguida de escrita para unicidade. Usar ID determinístico,
  documento-reserva e/ou transação.
- Definir região e política de backup antes de criar a base de produção.

## Modelo inicial de coleções

| Modelo atual           | Coleção proposta                            | Estratégia de identidade/unicidade       |
| ---------------------- | ------------------------------------------- | ---------------------------------------- |
| `User`                 | `users/{firebaseUid}`                       | UID do Firebase Auth; e-mail normalizado |
| `Session`              | removida após o corte                       | ID tokens e revogação do Firebase Auth   |
| `GeneralData`          | `generalData/{exercise}`                    | exercício como ID                        |
| `BudgetRecord`         | `budgetRecords/{exercise_informationType}`  | chave composta normalizada               |
| `FinancialDocument`    | `financialDocuments/{exercise_period_type}` | chave composta normalizada               |
| `HumanResourcesRecord` | `humanResources/{exercise_locality}`        | chave composta normalizada               |
| `ReportsIndicator`     | `reportsIndicators/{exercise}`              | exercício como ID                        |
| `PatrimonialAsset`     | `patrimonialAssets/{id}`                    | reserva de chave composta para conflito  |
| `Supplier`             | `suppliers/{id}`                            | índice/reserva separada por CNPJ         |
| `ContractRecord`       | `contracts/{id}`                            | reserva por fornecedor, data e exercício |

Os nomes e formatos finais só serão aprovados depois de listar todas as consultas
reais. Cada consulta deverá possuir índice, paginação e estimativa de leituras.

## Etapas

### Etapa 0 — Inventário, backup e critérios

- [ ] Congelar o schema lógico que será migrado.
- [ ] Inventariar volumes por tabela, tamanho de documentos e consultas por rota.
- [ ] Registrar constraints únicas, relações, transações e regras de publicação.
- [ ] Definir RPO, RTO, janela de manutenção e período de rollback.
- [ ] Criar backup verificável do PostgreSQL e ensaiar restauração.
- [ ] Definir critérios de paridade: contagem, campos, dinheiro, datas, autoria e
      documentos.

**Aceite:** inventário e restauração aprovados antes de criar dados no Firebase.

### Etapa 1 — Spike e ADR Firestore versus SQL Connect

- [ ] Implementar somente leitura e escrita de Dados Gerais nas duas opções.
- [ ] Prototipar consulta/publicação de contratos, incluindo unicidade.
- [ ] Medir esforço, custo estimado, latência, observabilidade e rollback.
- [ ] Escolher a tecnologia e registrar a decisão em `docs/adr/`.

**Aceite:** decisão explícita; não iniciar migração completa sem a ADR.

### Etapa 2 — Fundação Firebase

- [ ] Criar projetos dev, staging e produção com região definida.
- [ ] Configurar Firebase CLI e Local Emulator Suite.
- [ ] Versionar `firebase.json`, regras e índices.
- [ ] Configurar credenciais por ambiente na plataforma de deploy.
- [ ] Adicionar validação de variáveis Firebase sem remover variáveis Prisma.
- [ ] Configurar orçamento, alertas, logs, auditoria e backups.

**Aceite:** ambiente local e staging funcionam sem credenciais no repositório.

### Etapa 3 — Abstrações de persistência

- [ ] Confirmar que todos os services dependem de interfaces de repository.
- [ ] Criar adapters Firestore atrás das mesmas interfaces.
- [ ] Selecionar o provider por configuração durante a transição.
- [ ] Manter schemas Zod na entrada e na saída dos repositories.
- [ ] Criar conversores únicos para timestamps, dinheiro e valores opcionais.

**Aceite:** um módulo pode alternar Prisma/Firestore sem mudar controller, service
ou contrato HTTP.

### Etapa 4 — Autenticação

- [ ] Criar login por e-mail/senha no Firebase Authentication.
- [ ] Substituir tokens de sessão próprios por ID tokens verificados no Express.
- [ ] Mapear perfis e status para custom claims e documento `users`.
- [ ] Definir revogação, desativação, expiração e atualização de claims.
- [ ] Testar importação do hash `scrypt` próprio atual em um projeto descartável.
- [ ] Se o formato não for compatível, executar convite/redefinição obrigatória de
      senha; nunca migrar ou registrar senhas em texto puro.
- [ ] Manter o mecanismo atual disponível até validar todos os usuários migrados.

**Aceite:** login, logout, usuário atual e autorização administrativa mantêm o
comportamento esperado, com plano aprovado para todas as contas existentes.

### Etapa 5 — Modelo, índices e regras do Firestore

- [ ] Definir documentos e reservas de unicidade por módulo.
- [ ] Criar `firestore.indexes.json` a partir das consultas públicas/admin.
- [ ] Criar regras deny-by-default e acesso mínimo necessário.
- [ ] Implementar transações para publicação e chaves únicas.
- [ ] Definir paginação, limites e proteção contra leituras sem limite.
- [ ] Validar tamanho máximo dos documentos e crescimento dos arrays/objetos.

**Aceite:** queries, índices, transações e regras passam no emulador e em staging.

### Etapa 6 — Migração de repositories por módulo

Migrar e validar um módulo por vez:

1. Dados Gerais.
2. Relatórios e Indicadores.
3. Recursos Humanos.
4. Orçamentário.
5. Financeiro.
6. Patrimonial.
7. Fornecedores e Contratos.

Para cada módulo:

- [ ] implementar adapter Firestore;
- [ ] validar CRUD, publicação e conflitos;
- [ ] comparar respostas Prisma versus Firestore;
- [ ] liberar primeiro em staging;
- [ ] manter fallback para Prisma até o aceite.

### Etapa 7 — Documentos no Cloud Storage

- [ ] Definir caminhos imutáveis por módulo, exercício, registro e versão.
- [ ] Restringir MIME type, tamanho e perfil autorizado nas regras.
- [ ] Armazenar no Firestore apenas metadados, chave, URL controlada, checksum,
      tamanho, versão e autoria.
- [ ] Planejar URLs de download e retenção sem tornar o bucket público inteiro.
- [ ] Migrar arquivos e conferir checksum antes de atualizar referências.

**Aceite:** upload, download, substituição, auditoria e autorização validados.

### Etapa 8 — Ferramenta de migração e ensaios

- [ ] Criar export versionado do PostgreSQL sem segredos ou dados sensíveis no Git.
- [ ] Criar script idempotente de transformação e carga.
- [ ] Preservar IDs quando possível e manter mapa de IDs quando não for.
- [ ] Converter `Decimal` para centavos e datas para timestamps explicitamente.
- [ ] Migrar usuários, dados de domínio e arquivos em ordem documentada.
- [ ] Gerar relatório de reconciliação por coleção e por exercício.
- [ ] Executar pelo menos dois dry-runs completos em staging.

**Aceite:** dry-run reproduzível, idempotente e com reconciliação sem divergência.

### Etapa 9 — Paridade e homologação

- [ ] Comparar respostas de todas as rotas públicas e administrativas.
- [ ] Validar permissões por perfil e tentativas de acesso indevido.
- [ ] Validar publicação concorrente, unicidade e falhas parciais.
- [ ] Medir leituras, escritas, latência e custo com volume representativo.
- [ ] Validar restore de backup e rollback técnico.
- [ ] Obter aceite funcional da equipe responsável.

### Etapa 10 — Cutover de produção

- [ ] Comunicar e iniciar janela de manutenção ou bloqueio temporário de escrita.
- [ ] Fazer backup final e registrar contagens de origem.
- [ ] Executar carga incremental/final e reconciliação.
- [ ] Trocar autenticação e repositories por feature flags/configuração.
- [ ] Executar smoke test de login, CRUD, publicação e leitura pública.
- [ ] Monitorar erros, latência, custos e divergências.
- [ ] Manter PostgreSQL somente leitura durante o período de rollback.

**Abortar o corte** se houver divergência de contagem, dinheiro, autoria,
publicação, autenticação ou documentos.

### Etapa 11 — Estabilização e retirada do Prisma

- [ ] Encerrar o período de rollback somente após aceite formal.
- [ ] Remover dual-read/dual-write e feature flags temporárias.
- [ ] Remover Prisma, adapter PostgreSQL e migrations apenas em mudança separada.
- [ ] Revogar credenciais antigas e atualizar documentação operacional.
- [ ] Preservar backup final do PostgreSQL conforme política de retenção.

**Aceite:** Firebase é a fonte única, com backup, monitoramento e operação
documentados.

## Estratégia de rollback

1. Não apagar nem alterar irreversivelmente o PostgreSQL durante a migração.
2. No corte, bloquear escritas ou registrar todas as mutações para replay.
3. Manter a seleção de repository por configuração.
4. Se um critério de aborto ocorrer, reativar Prisma, restaurar autenticação antiga
   e reconciliar apenas as escritas feitas depois do corte.
5. Remover o caminho antigo somente depois do período de estabilidade aprovado.

## Critérios finais de aceite

- Todos os registros, valores monetários, timestamps, estados e autores conferem.
- Contratos HTTP e schemas Zod permanecem compatíveis.
- Somente dados publicados aparecem nas rotas públicas.
- Perfis e usuários desativados têm o mesmo nível de acesso esperado.
- Constraints únicas continuam efetivas sob concorrência.
- Arquivos conferem por checksum e não ficam expostos indevidamente.
- Backup, restauração, alertas, custos e runbook estão validados.
- O PostgreSQL pode ser desligado sem dependência oculta.

## Referências oficiais

- [Modelo de dados do Cloud Firestore](https://firebase.google.com/docs/firestore/data-model)
- [Transações e escritas em lote](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Índices do Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Verificação de ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Regras do Cloud Storage](https://firebase.google.com/docs/storage/security)
- [Exportação e importação do Firestore](https://firebase.google.com/docs/firestore/manage-data/export-import)
- [Firebase SQL Connect](https://firebase.google.com/docs/sql-connect)

## Próxima ação

Executar somente a Etapa 0 e, com o inventário pronto, iniciar o spike da Etapa 1.

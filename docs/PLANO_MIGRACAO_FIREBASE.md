# Plano de migração para Firebase

## Contexto e branch

- Executar esta trilha futuramente a partir da `main`, em branch própria.
- Não misturar a migração de persistência com a branch `refatoracao`.
- Preservar URLs, payloads, status HTTP, schemas Zod e regras de publicação.
- Manter Institucional, Administrativo, Glossário e LGPD como conteúdos estáticos,
  sem criar CRUD ou coleções artificiais.

## Estratégia recomendada

Manter controllers, services e contratos HTTP atuais. A troca acontece atrás das
interfaces de repository: os adapters Prisma continuam como referência enquanto
adapters Firebase são implementados e submetidos aos mesmos testes de contrato.

O desenho inicial a validar na etapa de descoberta é:

- Firebase Auth para identidade administrativa;
- Cloud Firestore para dados de gestão e publicação;
- Cloud Storage para documentos PDF, CSV e XLSX;
- Firebase Admin SDK somente no backend;
- frontend sem acesso direto às coleções administrativas.

## Etapas

### Etapa F0 — Descoberta e baseline

- Criar a branch de migração a partir da `main` atualizada.
- Inventariar volumes, relacionamentos, índices, transações e documentos existentes.
- Gerar backup verificável do PostgreSQL e registrar métricas e testes de baseline.
- Definir projetos Firebase separados para desenvolvimento, homologação e produção.
- Definir critérios objetivos de rollback antes de qualquer escrita em produção.

### Etapa F1 — Modelo e contratos de repository

- Mapear tabelas e relacionamentos para coleções/documentos sem copiar cegamente o
  modelo relacional.
- Preservar IDs estáveis, exercício, `publicationStatus` e vínculos entre contratos
  e fornecedores.
- Especificar unicidade, integridade referencial e operações atômicas que precisarão
  de transações ou documentos de controle no Firestore.
- Criar uma suíte de contrato executável contra adapters Prisma e Firebase.

### Etapa F2 — Infraestrutura Firebase isolada

- Adicionar configuração validada por ambiente e inicialização única do Admin SDK.
- Configurar emuladores para Auth, Firestore e Storage nos testes locais.
- Criar regras de segurança e índices versionados.
- Manter credenciais exclusivamente no ambiente de execução.

### Etapa F3 — Autenticação e autorização

- Migrar usuários administrativos para Firebase Auth com estratégia explícita para
  redefinição de senha; nunca transportar hashes incompatíveis de forma insegura.
- Representar `ADMIN`, `EDITOR` e `REVIEWER` de forma verificável no backend.
- Trocar a sessão própria pela validação de tokens do Firebase sem alterar as
  respostas HTTP consumidas pelo frontend.
- Redefinir persistência do login no navegador, renovação, logout entre abas,
  revogação e comportamento ao voltar pelo histórico.
- Migrar rate limits e bloqueios para armazenamento compartilhado compatível com a
  nova infraestrutura.

### Etapa F4 — Adapters por módulo

- Implementar um adapter Firebase por vez: Dados Gerais, Orçamentário, Financeiro,
  Recursos Humanos, Patrimonial, Contratos/Fornecedores e Relatórios.
- Manter services dependentes apenas das interfaces locais de repository.
- Executar a suíte de contrato e os testes de endpoint após cada módulo.
- Não habilitar leitura híbrida silenciosa; divergências devem falhar de forma
  observável.

### Etapa F5 — Documentos

- Migrar arquivos para Cloud Storage preservando metadados, categoria e exercício.
- Definir URLs, expiração, visibilidade pública e validação de tipo/tamanho.
- Verificar referências antes de trocar os metadados no Firestore.

### Etapa F6 — Migração dos dados

- Criar ferramenta idempotente de exportação, transformação, importação e validação.
- Executar ensaio completo em homologação com dados anonimizados ou cópia protegida.
- Comparar contagens, totais financeiros, vínculos, status e documentos por domínio.
- Registrar relatório de reconciliação e tempo necessário para a janela de corte.

### Etapa F7 — Cutover e rollback

- Congelar escritas durante a migração final ou adotar estratégia de sincronização
  previamente testada.
- Executar backup, migração, reconciliação e smoke tests antes de liberar tráfego.
- Monitorar autenticação, erros, latência e consistência dos dados publicados.
- Reverter para Prisma/PostgreSQL se qualquer critério de aceite falhar.

### Etapa F8 — Encerramento

- Remover Prisma, migrations e variáveis PostgreSQL somente após o período de
  estabilidade aprovado.
- Preservar o backup e o relatório de migração conforme a política de retenção.
- Atualizar arquitetura, operação, coleções de endpoint e plano de recuperação.

## Critérios de aceite

- Mesmos contratos HTTP e schemas compartilhados.
- Mesma matriz de permissões e fluxo rascunho/publicação.
- Nenhuma perda de registros, documentos ou relacionamentos.
- Testes de contrato aprovados nos adapters Firebase.
- Endpoints, frontend público e painel administrativo validados em homologação.
- Backup e rollback testados antes do corte de produção.

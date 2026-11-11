# Referência do backend em PHP

## Propósito

Os snippets PHP que sustentam o portal atual serão usados como documentação executável do comportamento existente durante a construção da API nova.

Eles devem ajudar a identificar:

- campos e tipos de cada categoria;
- filtros, ordenações e agrupamentos;
- consultas e relacionamentos;
- regras de validação;
- estrutura dos documentos e downloads;
- formatação e transformação dos dados exibidos;
- estados vazios e mensagens;
- eventuais rotinas de importação.

## Regra de migração

Os snippets não serão copiados diretamente para a nova aplicação. Cada comportamento será:

1. inventariado;
2. convertido em requisito ou contrato Zod;
3. modelado no Prisma/PostgreSQL;
4. implementado em serviço da API;
5. coberto por teste comparativo;
6. validado contra a página pública atual.

Isso preserva a regra útil sem transportar acoplamentos, SQL inseguro, dependências globais ou convenções específicas do WordPress.

## Documentos

PDFs, CSVs e planilhas serão tratados como registros versionados.

Metadados mínimos previstos:

- título;
- categoria e subtipo;
- exercício e período;
- formato e MIME type;
- tamanho e checksum;
- chave/URL no armazenamento;
- status de publicação;
- versão;
- autoria e datas de criação, revisão e publicação;
- texto alternativo ou descrição acessível quando aplicável.

O upload físico será feito para armazenamento de objetos. O banco guardará os metadados e o vínculo com o conteúdo publicado.

## Pendente

- Seis snippets PHP brutos foram recebidos em `docs/referencias/snippets/raw/` e permanecem fora do Git.
- Sanitizar credenciais, dados pessoais e caminhos privados antes de versionar qualquer trecho.
- Receber o snippet específico de orçamentário e confirmar se existe outro snippet administrativo.
- Identificar tabelas ou fontes de dados usadas atualmente.
- Inventariar os documentos oficiais e a política de retenção.

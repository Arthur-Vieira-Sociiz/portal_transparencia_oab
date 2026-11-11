# Snippets PHP do portal atual

Os snippets serão usados como referência para os contratos Zod, fixtures e,
posteriormente, para as regras da API. Eles não serão executados nem transplantados
diretamente para a aplicação nova.

## Como entregar

Coloque os arquivos originais em `raw/`, preferencialmente com um arquivo por
categoria:

```text
raw/
├── institucional.php
├── administrativo.php
├── orcamentario.php
├── financeiro.php
├── patrimonial.php
├── contratos-e-licitacoes.php
├── recursos-humanos.php
├── relatorios-e-indicadores.php
├── glossario.php
└── lgpd.php
```

Se uma categoria possuir vários snippets, use nomes descritivos, como
`financeiro-balancos.php` ou `financeiro-downloads.php`.

## Segurança

A pasta `raw/` está no `.gitignore`. Antes de qualquer snippet ser versionado,
devemos remover:

- usuários, senhas e URLs privadas de banco;
- tokens, chaves e credenciais;
- dados pessoais reais;
- caminhos internos que não sejam necessários para entender a regra.

Depois da revisão, o comportamento relevante será registrado em documentação,
schemas Zod, fixtures sintéticas e testes.

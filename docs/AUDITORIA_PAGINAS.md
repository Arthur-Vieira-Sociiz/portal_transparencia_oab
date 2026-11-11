# Auditoria das páginas atuais

## Escopo da fidelidade

A reprodução considera somente o conteúdo interno do Portal da Transparência:
títulos e textos da seção, indicadores, navegação entre categorias, filtros,
tabelas, documentos, gráficos e estados. Cabeçalho, menus globais e rodapé do
WordPress aparecem nas capturas apenas como contexto e não serão implementados no
React.

As dez páginas foram inspecionadas em 11 de novembro de 2026. Elas compartilham indicadores, navegação por categorias e estrutura visual, permitindo forte reutilização de componentes.

| Rota atual                 | Conteúdo específico                | Padrão principal             |
| -------------------------- | ---------------------------------- | ---------------------------- |
| `institucional`            | apresentação e normativos          | texto + links                |
| `administrativo`           | organograma e inscritos            | download + tabela            |
| `orcamentario`             | orçamento por exercício            | filtros + tabela             |
| `financeiro`               | demonstrativos e balancetes        | filtros + documentos         |
| `patrimonial`              | inventário de bens                 | filtros + tabela             |
| `contratos-e-licitacoes`   | contratos por fornecedor e ano     | filtros + lista/estado vazio |
| `recursos-humanos`         | documentos mensais por localidade  | filtros + documentos         |
| `relatorios-e-indicadores` | consolidados e evolução            | KPIs + gráficos              |
| `glossario`                | termos administrativos e contábeis | índice alfabético            |
| `lgpd`                     | política, cookies e direitos       | texto + accordions           |

## Componentes compartilháveis

- shell público;
- breadcrumb;
- grade de indicadores;
- navegação por categoria;
- barra de filtros;
- tabela responsiva;
- agrupamento de documentos e ação de download;
- estado vazio;
- cards de estatística, progresso e gráficos;
- índice alfabético;
- accordion.

## Atenções de conteúdo

- Indicadores atuais aparecem zerados e ainda referenciam o exercício de 2025.
- Algumas telas oferecem exercícios futuros ou diferentes entre si.
- Existem arquivos de teste e rótulos PDF/CSV incompatíveis com a extensão real.
- Há erros pontuais de acentuação e grafia.

Esses valores podem ser usados como fixtures temporárias, mas não devem virar regras permanentes. Antes da publicação, a OAB-AL deve validar textos, exercícios, arquivos e números oficiais.

## Referências

- <https://oab-al.org.br/transparencia/institucional>
- <https://oab-al.org.br/transparencia/administrativo>
- <https://oab-al.org.br/transparencia/orcamentario>
- <https://oab-al.org.br/transparencia/financeiro>
- <https://oab-al.org.br/transparencia/patrimonial>
- <https://oab-al.org.br/transparencia/contratos-e-licitacoes>
- <https://oab-al.org.br/transparencia/recursos-humanos>
- <https://oab-al.org.br/transparencia/relatorios-e-indicadores>
- <https://oab-al.org.br/transparencia/glossario>
- <https://oab-al.org.br/transparencia/lgpd>

# Inventário dos snippets PHP

## Resultado da primeira entrega

Foram recebidos seis arquivos e armazenados localmente em
`docs/referencias/snippets/raw/`. Essa pasta é ignorada pelo Git até que qualquer
credencial, dado pessoal ou caminho privado seja removido.

| Área                     | Shortcode                | Post type legado       | Filtros observados            |
| ------------------------ | ------------------------ | ---------------------- | ----------------------------- |
| Relatórios e indicadores | `dashboard_dados_gerais` | `dados-gerais`         | exercício                     |
| Recursos humanos         | `lista_rh`               | `recursos-humanos`     | exercício, localidade         |
| Patrimonial              | `lista_patrimonial`      | `patrimonial`          | exercício, tipo, situação     |
| Financeiro               | `lista_financeiro`       | `financeiro_transpare` | exercício, tipo de informação |
| Contratos                | `contratos_licitacoes`   | `contratos-e-licitaco` | exercício, fornecedor, busca  |
| Administrativo 2         | `tabela_administrativo`  | `administrativo`       | exercício                     |

Não foi recebido um arquivo separado para a página orçamentária. O dashboard de
relatórios contém indicadores de execução orçamentária, mas não substitui o
snippet específico dessa página.

## Campos e regras aproveitáveis

### Relatórios e indicadores

- valores anuais de receita, despesa, resultado, orçamento previsto e executado;
- percentual de execução;
- indicadores de inscritos, atendimentos, protocolos, certidões e ouvidoria;
- contratos ativos, encerrados, novas licitações e valor total;
- total de colaboradores;
- crescimento anual calculado em relação ao exercício anterior;
- séries históricas para gráficos.

### Recursos humanos

- um registro por exercício e localidade;
- doze meses apresentados mesmo quando não possuem arquivo;
- até dois documentos por mês: PDF e CSV;
- exercício mais recente e primeira localidade como seleção inicial.

### Patrimonial

- tipo de informação, descrição, localização, valor de aquisição, situação,
  exercício e documento;
- filtros obtidos dinamicamente a partir dos valores existentes;
- situações são texto livre no legado e ainda precisam ser inventariadas antes
  de se tornarem enum.

### Financeiro

- um registro por exercício;
- seções de balancetes, demonstrativos, receitas e despesas;
- períodos trimestrais e anual;
- cada item pode possuir PDF, CSV ou ambos;
- seções sem documentos não são exibidas.

### Contratos

- fornecedor, CNPJ, vigência, valor, documento principal e aditivos;
- busca textual e filtros por exercício e fornecedor;
- mensagem de estado vazio;
- o campo legado `arquivos` aparenta aceitar somente um arquivo e precisa ser
  confirmado antes de modelarmos múltiplos aditivos no banco.

### Administrativo 2

- quantitativos por subseção: advogados, estagiários, suplementares e advogados
  em transferência;
- total por linha e totais gerais são valores derivados, não dados persistidos;
- exercícios estão fixos entre 2000 e 2026 no snippet.

## Decisões para os contratos novos

- Zod é a fonte de verdade compartilhada entre frontend e API.
- Tipos TypeScript são inferidos com `z.infer`; não haverá interfaces duplicadas.
- Documentos usam uma estrutura comum com formato, URL, categoria, exercício e
  período.
- Totais, crescimento e valores disponíveis são calculados a partir dos dados
  básicos.
- Identificadores de post types, nomes ACF e handlers AJAX não fazem parte do
  contrato novo.
- Anos fixos, HTML, CSS e JavaScript embutidos não serão transplantados.

## Pendências

- receber o snippet específico da página orçamentária;
- confirmar se existe um primeiro snippet administrativo além de
  `administrativo-2`;
- inventariar valores reais de situação patrimonial e localidades;
- confirmar multiplicidade dos aditivos contratuais;
- receber snippets de institucional, glossário e LGPD caso possuam dados
  dinâmicos.

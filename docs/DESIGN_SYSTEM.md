# Design system

O design system normativo está em [`DESIGN.md`](../DESIGN.md), com tokens legíveis por ferramentas no frontmatter. A extensão para o painel Impeccable está em [`.impeccable/design.json`](../.impeccable/design.json).

As trinta capturas de referência estão em [`docs/referencias`](./referencias/README.md).

## Direção

- tema claro;
- fidelidade à identidade atual da OAB-AL;
- alta legibilidade para números, documentos, filtros, tabelas e gráficos;
- mesma linguagem visual em `/admin` e `/public`, com densidades e ações próprias para cada contexto;
- Inter mantida de forma intencional por ser a fonte observada na referência.

## Tokens preliminares

| Papel              | Valor observado     |
| ------------------ | ------------------- |
| Azul institucional | `#263851`           |
| Fundo principal    | `#FFFFFF`           |
| Fundo neutro       | `#EDEFF1`           |
| Texto principal    | `#333333`           |
| Texto secundário   | `#69727D`           |
| Fonte de interface | `Inter, sans-serif` |

## Pendências antes da UI

- aprovação humana do contrato visual consolidado em `DESIGN.md`;
- inventário dos arquivos oficiais de logo e ícones;
- validação dos contrastes finais quando os componentes estiverem implementados.

Os valores aprovados serão tokens CSS compartilhados por todas as áreas. Componentes de página não devem conter valores visuais estruturais hardcoded.

import {
  PublicGlossaryPageSchema,
  type PublicGlossaryPage,
} from '@oab-transparencia/contracts'

const glossaryFixture = {
  introduction:
    'Este glossário foi elaborado para facilitar a compreensão dos principais termos financeiros, contábeis, orçamentários, patrimoniais e administrativos utilizados no Portal da Transparência da OAB Alagoas.',
  entries: [
    {
      term: 'Acesso público',
      definition:
        'Disponibilização de informações institucionais para consulta pela advocacia e pela sociedade.',
    },
    {
      term: 'Administrativo',
      definition:
        'Categoria que reúne informações relacionadas à organização, funcionamento, estrutura e gestão administrativa da instituição.',
    },
    {
      term: 'Advogados ativos',
      definition:
        'Quantidade de advogadas e advogados com inscrição regular e ativa junto à OAB Alagoas.',
    },
    {
      term: 'Ano ou exercício',
      definition:
        'Período de referência das informações apresentadas no portal, normalmente correspondente ao ano civil.',
    },
    {
      term: 'Atualização',
      definition:
        'Indicação do mês ou período em que determinada informação foi inserida ou revisada no portal.',
    },
    {
      term: 'Baixar CSV',
      definition:
        'Opção para fazer download dos dados em formato de planilha, permitindo análise, filtragem e tratamento das informações.',
    },
    {
      term: 'Baixar PDF',
      definition:
        'Opção para fazer download do relatório em formato PDF, adequado para leitura, arquivamento e impressão.',
    },
    {
      term: 'Balancete',
      definition:
        'Relatório contábil periódico que apresenta, de forma resumida, as movimentações das contas em determinado período.',
    },
    {
      term: 'Balanço patrimonial',
      definition:
        'Demonstração contábil que apresenta a situação patrimonial da instituição, com seus bens, direitos, obrigações e patrimônio líquido.',
    },
    {
      term: 'Bem patrimonial',
      definition:
        'Item pertencente à instituição, como imóveis, móveis, equipamentos, veículos e demais bens utilizados em suas atividades.',
    },
    {
      term: 'Categoria',
      definition:
        'Forma de organização das informações no portal, como institucional, administrativo, orçamentário, financeiro, patrimonial e contratos.',
    },
    {
      term: 'Contratos',
      definition:
        'Instrumentos que formalizam obrigações entre a OAB Alagoas e terceiros, com definição de objeto, valor, prazo e condições.',
    },
    {
      term: 'Controle social',
      definition:
        'Acompanhamento das informações institucionais pela advocacia e pela sociedade, fortalecendo a transparência e a responsabilidade da gestão.',
    },
    {
      term: 'CSV',
      definition:
        'Formato de arquivo utilizado para disponibilizar dados em planilha, facilitando consultas, filtros e análises.',
    },
    {
      term: 'Demonstrativos financeiros',
      definition:
        'Relatórios que apresentam informações financeiras consolidadas da instituição em determinado período.',
    },
    {
      term: 'Despesa',
      definition:
        'Gasto realizado para custeio das atividades institucionais, administrativas, operacionais ou finalísticas.',
    },
    {
      term: 'Despesas totais',
      definition:
        'Soma das despesas registradas no período informado no portal.',
    },
    {
      term: 'Dotação inicial',
      definition:
        'Valor previsto inicialmente no orçamento para determinada finalidade, ação, categoria ou despesa.',
    },
    {
      term: 'Execução orçamentária',
      definition:
        'Acompanhamento da utilização do orçamento previsto, demonstrando quanto foi planejado, comprometido ou executado.',
    },
    {
      term: 'Exercício financeiro',
      definition:
        'Período de controle das receitas, despesas e demais informações contábeis e financeiras, geralmente correspondente ao ano civil.',
    },
    {
      term: 'Evolução da execução orçamentária',
      definition:
        'Demonstração do comportamento da execução do orçamento ao longo do tempo.',
    },
    {
      term: 'Financeiro',
      definition:
        'Categoria que reúne informações sobre receitas, despesas, balancetes e demonstrativos financeiros.',
    },
    {
      term: 'Filtro',
      definition:
        'Ferramenta de seleção utilizada para localizar informações por ano, tipo de informação, tipo de bem, situação ou outra classificação disponível.',
    },
    {
      term: 'Gestão financeira',
      definition:
        'Conjunto de práticas voltadas ao planejamento, controle e acompanhamento dos recursos financeiros da instituição.',
    },
    {
      term: 'Gestão patrimonial',
      definition:
        'Controle dos bens pertencentes à instituição, incluindo registro, localização, situação e conservação.',
    },
    {
      term: 'Governança',
      definition:
        'Conjunto de práticas, regras e processos que orientam a gestão institucional, fortalecendo responsabilidade, transparência e eficiência.',
    },
    {
      term: 'Índice de execução orçamentária',
      definition:
        'Percentual que indica quanto do orçamento previsto já foi utilizado ou executado no período selecionado.',
    },
    {
      term: 'Informação consolidada',
      definition:
        'Dado apresentado de forma agrupada ou resumida, facilitando a leitura e o acompanhamento dos resultados.',
    },
    {
      term: 'Institucional',
      definition:
        'Categoria que reúne informações relacionadas à estrutura, atuação, organização e dados gerais da OAB Alagoas.',
    },
    {
      term: 'Localização',
      definition:
        'Indicação do local onde determinado bem patrimonial está situado ou vinculado.',
    },
    {
      term: 'Movimentação financeira',
      definition:
        'Registro de entradas e saídas de recursos financeiros da instituição.',
    },
    {
      term: 'Orçamentário',
      definition:
        'Categoria que apresenta informações relacionadas ao orçamento, sua previsão, execução e acompanhamento.',
    },
    {
      term: 'Orçamento',
      definition:
        'Planejamento financeiro que estima receitas e despesas para determinado exercício.',
    },
    {
      term: 'Orçamento anual',
      definition:
        'Valor total previsto para determinado ano, conforme planejamento orçamentário da instituição.',
    },
    {
      term: 'Orçamento executado',
      definition:
        'Valor do orçamento que já foi utilizado, comprometido ou executado no período informado.',
    },
    {
      term: 'Orçamento previsto',
      definition:
        'Valor planejado inicialmente para determinada finalidade, categoria ou exercício.',
    },
    {
      term: 'Patrimonial',
      definition:
        'Categoria que reúne informações sobre os bens pertencentes à OAB Alagoas e sua situação patrimonial.',
    },
    {
      term: 'Patrimônio',
      definition:
        'Conjunto de bens, direitos e valores pertencentes à instituição.',
    },
    {
      term: 'Patrimônio institucional',
      definition:
        'Conjunto de bens e recursos que integram a estrutura material da OAB Alagoas.',
    },
    {
      term: 'PDF',
      definition:
        'Formato de arquivo utilizado para disponibilização de relatórios em versão de leitura, impressão e arquivamento.',
    },
    {
      term: 'Percentual de execução',
      definition:
        'Indicador que demonstra, em porcentagem, quanto do orçamento previsto já foi executado.',
    },
    {
      term: 'Prestação de contas',
      definition:
        'Apresentação organizada de informações financeiras, contábeis, orçamentárias, patrimoniais e administrativas da gestão.',
    },
    {
      term: 'Progresso da execução orçamentária',
      definition:
        'Representação visual ou numérica do avanço da utilização do orçamento no exercício selecionado.',
    },
    {
      term: 'Quadro sintético de despesas',
      definition:
        'Relatório resumido que apresenta as principais informações sobre as despesas de determinado período.',
    },
    {
      term: 'Quadro sintético de receitas',
      definition:
        'Relatório resumido que apresenta as principais informações sobre as receitas de determinado período.',
    },
    {
      term: 'Quantidade de inscritos',
      definition:
        'Número total de pessoas inscritas nos registros da OAB Alagoas, conforme o critério apresentado no portal.',
    },
    {
      term: 'Receita',
      definition:
        'Valor arrecadado ou recebido pela instituição, conforme as fontes previstas em sua estrutura financeira.',
    },
    {
      term: 'Receitas totais',
      definition:
        'Soma das receitas registradas no período informado no portal.',
    },
    {
      term: 'Relatório de despesas',
      definition:
        'Documento que apresenta informações sobre os gastos realizados ou registrados em determinado período.',
    },
    {
      term: 'Relatório de receitas',
      definition:
        'Documento que apresenta informações sobre os valores recebidos ou arrecadados em determinado período.',
    },
    {
      term: 'Saldo disponível',
      definition:
        'Valor ainda disponível após a comparação entre o orçamento previsto e o valor executado.',
    },
    {
      term: 'Salas de apoio',
      definition:
        'Estruturas disponibilizadas pela OAB Alagoas para atendimento, suporte ou apoio à advocacia.',
    },
    {
      term: 'Situação',
      definition:
        'Condição atual de determinado registro, bem, contrato ou informação apresentada no portal.',
    },
    {
      term: 'Sociedades advocatícias ativas',
      definition:
        'Quantidade de sociedades de advocacia com registro ativo junto à OAB Alagoas.',
    },
    {
      term: 'Tipo de bem',
      definition:
        'Classificação utilizada para identificar a natureza do bem patrimonial, como imóvel, móvel, equipamento, veículo ou outro tipo cadastrado.',
    },
    {
      term: 'Tipo de informação',
      definition:
        'Classificação utilizada para organizar os dados disponíveis no portal, como orçamento, receita, despesa, balancete, demonstrativo ou patrimônio.',
    },
    {
      term: 'Transparência',
      definition:
        'Disponibilização clara, organizada e acessível de informações de interesse institucional, permitindo acompanhamento pela advocacia e pela sociedade.',
    },
    {
      term: 'Valor disponível',
      definition:
        'Diferença entre o valor previsto e o valor executado, quando aplicável ao acompanhamento orçamentário.',
    },
    {
      term: 'Valor executado',
      definition:
        'Valor efetivamente utilizado, registrado ou comprometido dentro do orçamento ou da categoria analisada.',
    },
    {
      term: 'Valor previsto',
      definition:
        'Valor planejado ou estimado para determinada ação, despesa, receita, categoria ou exercício.',
    },
    {
      term: 'Zeladoria patrimonial',
      definition:
        'Conjunto de cuidados relacionados à conservação, controle, manutenção e uso adequado dos bens da instituição.',
    },
  ],
} satisfies PublicGlossaryPage

export const parsedGlossaryFixture =
  PublicGlossaryPageSchema.parse(glossaryFixture)

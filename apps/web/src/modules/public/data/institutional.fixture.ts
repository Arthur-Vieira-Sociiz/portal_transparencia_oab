import {
  PublicInstitutionalPageSchema,
  PublicSummarySchema,
  type PublicInstitutionalPage,
} from '@oab-transparencia/contracts'

export const emptyPublicSummary = PublicSummarySchema.parse({
  exercise: new Date().getFullYear(),
  totalExpenses: 0,
  totalRevenue: 0,
  budget: 0,
  patrimony: 0,
  activeLawyers: 0,
  activeSocieties: 0,
  supportRooms: 0,
  registeredMembers: 0,
})

const institutionalFixture = {
  summary: emptyPublicSummary,
  content: {
    introduction: [
      'O Portal da Transparência da OAB Alagoas foi criado para ampliar o acesso da advocacia e da sociedade às informações institucionais da Seccional, fortalecendo a publicidade dos atos de gestão, o controle social e o compromisso permanente da Ordem com a ética, a responsabilidade e a boa governança.',
      'A Ordem dos Advogados do Brasil possui natureza jurídica própria e exerce papel essencial na defesa da Constituição Federal, do Estado Democrático de Direito, da cidadania e da advocacia. Nesse contexto, a transparência institucional representa um compromisso permanente da OAB/AL com a ética, a responsabilidade, a boa governança e a aproximação com a sociedade.',
      'Neste espaço, a OAB/AL disponibiliza informações relacionadas à sua atuação administrativa, financeira e institucional, permitindo que advogadas, advogados e a sociedade acompanhem dados relevantes sobre a gestão da Seccional, seus investimentos, contratos, relatórios, ações, projetos e demais informações de interesse coletivo.',
      'O Portal da Transparência também reforça o compromisso da OAB/AL com a modernização administrativa, a inovação, a eficiência e a aproximação com a advocacia alagoana. Mais do que uma ferramenta de consulta, este ambiente representa um canal de acesso à informação, fortalecimento institucional e prestação de contas à advocacia e à sociedade.',
    ],
    regulations: [
      'Resolução nº 04/2014 – Conselho Federal da OAB',
      'Provimento nº 185/2018 – Conselho Federal da OAB',
      'Provimento nº 216/2023 – Conselho Federal da OAB',
      'Regulamento Geral do Estatuto da Advocacia e da OAB',
      'Estatuto da Advocacia e da OAB – Lei nº 8.906/1994',
    ],
  },
} satisfies PublicInstitutionalPage

export const parsedInstitutionalFixture =
  PublicInstitutionalPageSchema.parse(institutionalFixture)

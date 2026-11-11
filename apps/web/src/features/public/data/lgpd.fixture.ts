import {
  PublicLgpdPageSchema,
  type PublicLgpdPage,
} from '@oab-transparencia/contracts'

const lgpdFixture = {
  introduction: [
    'A OAB Alagoas preza pela transparência, pela segurança das informações e pelo respeito aos direitos dos titulares de dados pessoais. Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), esta seção reúne, de forma clara e acessível, as informações sobre como os dados pessoais são tratados, protegidos e utilizados pela instituição.',
    'Aqui, o(a) cidadão(ã) poderá conhecer as políticas adotadas, os direitos garantidos pela legislação, os canais de atendimento ao titular de dados e as responsabilidades da OAB/AL no tratamento dessas informações, reforçando o compromisso institucional com a privacidade, a legalidade e a boa governança.',
  ],
  groups: [
    {
      id: 'privacy-policy',
      sections: [
        {
          id: 'introduction',
          title: 'Introdução',
          content:
            'Nossa política de privacidade tem como compromisso a segurança na proteção dos seus dados pessoais, com base em nossos princípios e valores, assegurando sempre a privacidade do usuário.',
        },
        {
          id: 'preamble',
          title: 'Preâmbulo',
          content:
            'A política apresenta os conceitos de dados pessoais, dados pessoais sensíveis, controlador, operador, encarregado de dados e usuário da plataforma, que orientam o tratamento de informações pela OAB Alagoas.',
        },
        {
          id: 'consent',
          title:
            '1. Do consentimento do usuário para coleta, armazenamento e tratamento de Dados Pessoais',
          content:
            'A coleta e o tratamento de dados têm por base o consentimento do titular, solicitado no primeiro acesso, em atualizações da política ou quando necessário para uma ação específica.',
        },
        {
          id: 'collected-data',
          title: '2. Dos Dados Pessoais coletados pela OAB Alagoas',
          content:
            'Nos canais “Entre em contato” e “Trabalhe conosco”, podem ser coletados nome, e-mail, telefone, mensagem, cargo pretendido e currículo.',
        },
        {
          id: 'treatment',
          title: '3. Do tratamento de dados pessoais pela OAB Alagoas',
          content:
            'Os dados são tratados para prestação de serviços, comunicação, segurança, melhoria da plataforma, cumprimento de obrigações legais e atendimento a solicitações legítimas.',
        },
        {
          id: 'sensitive-data',
          title: '4. Do tratamento de dados pessoais sensíveis',
          content:
            'Dados pessoais sensíveis recebem armazenamento seguro e não são compartilhados com terceiros sem consentimento expresso e destacado do titular, salvo hipóteses legais aplicáveis.',
        },
        {
          id: 'sharing',
          title: '5. Do compartilhamento de dados pessoais com terceiros',
          content:
            'A OAB Alagoas pode compartilhar dados com fornecedores necessários à prestação de serviços, mas não comercializa dados pessoais de usuários.',
        },
        {
          id: 'retention',
          title: '6. Retenção e processamento de dados pessoais',
          content:
            'Os dados são mantidos apenas pelo tempo necessário para operar os serviços, atender os propósitos desta política, cumprir obrigações legais e resguardar direitos.',
        },
        {
          id: 'rights',
          title: '7. Seus Direitos sobre seus Dados Pessoais',
          content:
            'O titular pode confirmar o tratamento, acessar, corrigir, anonimizar, bloquear, eliminar, portar dados e revogar consentimento, nos limites da legislação aplicável.',
        },
        {
          id: 'controller',
          title: '8. Controlador e operador de dados',
          content:
            'A OAB Alagoas atua como controladora dos dados coletados em seus próprios canais de contato e como operadora quando processa dados em plataformas de clientes.',
        },
        {
          id: 'security',
          title: '9. Segurança dos Dados Pessoais',
          content:
            'A instituição adota medidas técnicas, físicas, organizacionais e legais para proteger os dados e avalia eventuais incidentes conforme a Lei Geral de Proteção de Dados.',
        },
        {
          id: 'changes',
          title: '10. Mudanças na Política de Privacidade',
          content:
            'Mudanças técnicas ou jurídicas podem atualizar a política. Quando aplicável, os usuários serão informados e poderão renovar o consentimento e exercer seus direitos.',
        },
        {
          id: 'contact',
          title: 'Contato',
          content:
            'O atendimento ao titular de dados é realizado pelos canais oficiais da OAB Alagoas e pelo encarregado de proteção de dados indicado pela instituição.',
        },
      ],
    },
    {
      id: 'cookie-categories',
      sections: [
        {
          id: 'essential-cookies',
          title: 'Cookies essenciais',
          content:
            'Cookies essenciais permitem a navegação e o acesso a áreas seguras do site. Sem eles, serviços que dependem dessa funcionalidade não podem ser prestados.',
        },
        {
          id: 'analytics-cookies',
          title: 'Cookies analíticos',
          content:
            'Cookies analíticos ajudam a entender o uso e a performance do site, permitindo identificar melhorias sem coletar dados pessoais para essa finalidade.',
        },
        {
          id: 'functional-cookies',
          title: 'Cookies de funcionalidade',
          content:
            'Cookies de funcionalidade guardam preferências para que o usuário não precise configurar o site novamente a cada visita.',
        },
      ],
    },
    {
      id: 'cookie-lifecycle',
      sections: [
        {
          id: 'persistent-cookies',
          title: 'Cookies permanentes',
          content:
            'Ficam armazenados no navegador e podem ser usados em visitas futuras para personalizar a navegação de acordo com os interesses do usuário.',
        },
        {
          id: 'session-cookies',
          title: 'Cookies de sessão',
          content:
            'São temporários e permanecem no navegador até a saída do site, contribuindo para identificar problemas e melhorar a experiência de navegação.',
        },
        {
          id: 'disable-cookies',
          title: 'Como desativar os cookies',
          content:
            'Cookies podem ser bloqueados ou apagados nas configurações do navegador. Essa escolha pode afetar parcial ou totalmente o funcionamento de alguns serviços.',
        },
        {
          id: 'third-party-cookies',
          title: 'Sobre cookies de terceiros',
          content:
            'Provedores de serviço podem usar tecnologias próprias para identificar navegador e dispositivo; o usuário pode controlar parte dessas práticas com ferramentas do navegador.',
        },
        {
          id: 'tracking',
          title: 'Tecnologias de rastreamento',
          content:
            'A plataforma pode utilizar tecnologias como web beacons e URLs de rastreamento para entender o interesse em conteúdos e avaliar comunicações, conforme a legislação aplicável.',
        },
      ],
    },
  ],
} satisfies PublicLgpdPage

export const parsedLgpdFixture = PublicLgpdPageSchema.parse(lgpdFixture)

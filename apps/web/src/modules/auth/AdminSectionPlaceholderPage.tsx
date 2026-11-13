import { Clock3 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminShell } from './AdminShell'

const sectionLabels: Record<string, string> = {
  administrativo: 'Administrativo',
  orcamentario: 'Orçamentário',
  financeiro: 'Financeiro',
  patrimonial: 'Patrimonial',
  'contratos-e-licitacoes': 'Contratos e licitações',
  'recursos-humanos': 'Recursos humanos',
  'relatorios-e-indicadores': 'Relatórios e indicadores',
  glossario: 'Glossário',
  lgpd: 'LGPD',
  dashboard: 'Visão geral',
}

export function AdminSectionPlaceholderPage({ section }: { section: string }) {
  const title = sectionLabels[section] ?? 'Módulo administrativo'
  return (
    <AdminShell
      description="O módulo está organizado e pronto para receber o formulário e a pré-visualização."
      title={title}
    >
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="text-[#cc3366]" size={20} /> Próxima etapa deste
            módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-[#69727d]">
          <p>
            Esta categoria já está disponível no menu para manter a navegação
            consistente entre as dez páginas do portal.
          </p>
          <p>
            O próximo trabalho será transformar os campos do snippet PHP
            correspondente em um formulário simples, com rascunho,
            pré-visualização, documentos e publicação.
          </p>
        </CardContent>
      </Card>
    </AdminShell>
  )
}

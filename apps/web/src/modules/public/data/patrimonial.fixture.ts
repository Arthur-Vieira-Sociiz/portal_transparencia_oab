import {
  PublicPatrimonialPageSchema,
  type PublicPatrimonialPage,
} from '@oab-transparencia/contracts'

const patrimonialFixture = {
  availableExercises: [2026, 2025],
  assets: [
    {
      id: 'asset-headquarters-jacarecica',
      informationType: 'Imóvel',
      description: 'Sede administrativa da OAB/AL',
      location: 'Jacarecica, Maceió/AL',
      acquisitionValue: 8_750_000,
      status: 'Ativo',
      exercise: 2026,
    },
    {
      id: 'asset-support-room-arapiraca',
      informationType: 'Mobiliário',
      description: 'Mobiliário da sala de apoio à advocacia',
      location: 'Arapiraca/AL',
      acquisitionValue: 186_400,
      status: 'Locado',
      exercise: 2026,
    },
    {
      id: 'asset-it-equipment',
      informationType: 'Equipamentos de informática',
      description: 'Estações de trabalho e equipamentos de rede',
      location: 'Jacarecica, Maceió/AL',
      acquisitionValue: 242_800,
      status: 'Emprestado',
      exercise: 2025,
    },
  ],
} satisfies PublicPatrimonialPage

export const parsedPatrimonialFixture =
  PublicPatrimonialPageSchema.parse(patrimonialFixture)

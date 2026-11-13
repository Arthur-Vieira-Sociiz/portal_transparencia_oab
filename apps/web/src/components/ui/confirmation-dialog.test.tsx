import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConfirmationDialog } from './confirmation-dialog'

function DialogHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Excluir item
      </button>
      <ConfirmationDialog
        cancelLabel="Cancelar"
        confirmLabel="Confirmar exclusão"
        description="Esta ação não pode ser desfeita."
        onCancel={() => setOpen(false)}
        onConfirm={() => undefined}
        open={open}
        title="Excluir registro"
      />
    </>
  )
}

describe('ConfirmationDialog', () => {
  it('manages focus, keyboard navigation and Escape', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    const trigger = screen.getByRole('button', { name: 'Excluir item' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Excluir registro' })
    const cancel = screen.getByRole('button', { name: 'Cancelar' })
    const confirm = screen.getByRole('button', { name: 'Confirmar exclusão' })
    const close = screen.getByRole('button', { name: 'Fechar confirmação' })

    expect(dialog).toHaveAccessibleDescription(
      'Esta ação não pode ser desfeita.',
    )
    expect(cancel).toHaveFocus()

    await user.tab()
    expect(confirm).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(dialog).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})

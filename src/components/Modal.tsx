import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

export function Modal({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => { dialog?.close() }
  }, [])
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onClose={event => {
    // Um close antigo pode chegar depois que o StrictMode já reabriu o diálogo.
    if (!event.currentTarget.open) onClose()
  }} onCancel={event => { if (busy) event.preventDefault() }} onClick={event => {
    if (!busy && event.target === event.currentTarget) ref.current?.close()
  }}>
    <div className="modal-body">
      <div className="modal-heading"><h3 id={titleId}>{title}</h3>
        <button className="icon-button" aria-label="Fechar janela" disabled={busy} onClick={onClose}><Icon name="close" /></button>
      </div>
      {children}
    </div>
  </dialog>
}
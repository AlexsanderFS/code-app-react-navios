import { useState } from 'react'
import { useShips } from '../context/ShipsContext'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { ShipForm } from '../components/ShipForm'
import { formatCoordinate } from '../domain/shipValidation'
import type { Ship } from '../types/ship'

export default function ShipsPage() {
  const { ships, loading, create, update, remove } = useShips()
  const [form, setForm] = useState<{ ship?: Ship } | null>(null)
  const [toDelete, setToDelete] = useState<Ship | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  async function confirmDelete() {
    if (!toDelete || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await remove(toDelete.id)
      setNotice(toDelete.name + ' foi excluído.')
      setToDelete(null)
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'Não foi possível excluir o navio.')
    } finally { setDeleting(false) }
  }
  return <>
    <div className="page-heading">
      <div><h2>Seus navios</h2><p className="muted">Uma frota organizada começa com bons registros.</p></div>
      <button className="button primary new-ship-button" onClick={() => { setNotice(''); setForm({}) }} disabled={loading}><Icon name="plus" size={18} />Novo navio</button>
    </div>
    <div className="session-note"><Icon name="ship" size={17} /><span>Dados de demonstração. As alterações ficam nesta sessão e são reiniciadas ao recarregar.</span></div>
    {notice ? <div className="notice" role="status">{notice}</div> : null}
    <section className="panel ships-panel" aria-labelledby="registered-ships">
      <div className="list-toolbar"><h3 id="registered-ships">Navios cadastrados</h3><span className="count-badge">{ships.length}</span></div>
      {loading ? <p className="muted loading-state" role="status">Carregando navios…</p> : ships.length === 0 ?
        <div className="empty-state"><Icon name="ship" size={34} /><h3>Nenhum navio cadastrado</h3><p className="muted">Cadastre seu primeiro navio para vê-lo no mapa.</p><button className="button primary" onClick={() => setForm({})}><Icon name="plus" size={18} />Novo navio</button></div> :
        <table className="ships-table" role="table">
          <caption className="sr-only">Navios cadastrados, suas posições e ações de edição e exclusão</caption>
          <thead role="rowgroup"><tr role="row"><th scope="col">Navio</th><th scope="col">Latitude</th><th scope="col">Longitude</th><th scope="col">Ações</th></tr></thead>
          <tbody role="rowgroup">{ships.map(ship => <tr key={ship.id} role="row">
            <td role="cell" className="ship-name-cell"><span className="card-icon"><Icon name="ship" size={19} /></span><strong>{ship.name}</strong></td>
            <td role="cell" className="coordinate-cell" data-label="Latitude"><span>{formatCoordinate(ship.latitude)}</span></td>
            <td role="cell" className="coordinate-cell" data-label="Longitude"><span>{formatCoordinate(ship.longitude)}</span></td>
            <td role="cell" className="ship-actions"><button className="row-action" aria-label={'Editar ' + ship.name} onClick={() => { setNotice(''); setForm({ ship }) }}><Icon name="edit" size={16} /><span>Editar</span></button><button className="row-action delete-action" aria-label={'Excluir ' + ship.name} onClick={() => { setDeleteError(null); setToDelete(ship) }}><Icon name="trash" size={16} /><span>Excluir</span></button></td>
          </tr>)}</tbody>
        </table>}
    </section>
    {form ? <ShipForm ship={form.ship} onCancel={() => setForm(null)} onSave={async input => {
      if (form.ship) { await update(form.ship.id, input); setNotice(input.name + ' foi atualizado.') }
      else { await create(input); setNotice(input.name + ' foi cadastrado.') }
      setForm(null)
    }} /> : null}
    {toDelete ? <Modal title="Excluir navio" onClose={() => setToDelete(null)} busy={deleting}>
      <p className="delete-description">Deseja excluir <strong>{toDelete.name}</strong>? O navio também será removido do mapa.</p>
      {deleteError ? <p role="alert" className="form-error">{deleteError}</p> : null}
      <div className="modal-actions"><button className="button secondary" autoFocus disabled={deleting} onClick={() => setToDelete(null)}>Cancelar</button><button className="button danger" disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? 'Excluindo…' : 'Excluir navio'}</button></div>
    </Modal> : null}
  </>
}
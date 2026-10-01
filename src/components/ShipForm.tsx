import { useId, useRef, useState, type FormEvent } from 'react'
import type { Ship, ShipInput } from '../types/ship'
import { parseCoordinate, validateShip, type ShipErrors } from '../domain/shipValidation'
import { Modal } from './Modal'

export function ShipForm({ ship, onSave, onCancel }: { ship?: Ship; onSave: (input: ShipInput) => Promise<void>; onCancel: () => void }) {
  const formId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const latitudeRef = useRef<HTMLInputElement>(null)
  const longitudeRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(ship?.name ?? '')
  const [latitude, setLatitude] = useState(ship?.latitude != null ? String(ship.latitude).replace('.', ',') : '')
  const [longitude, setLongitude] = useState(ship?.longitude != null ? String(ship.longitude).replace('.', ',') : '')
  const [errors, setErrors] = useState<ShipErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    const input = { name: name.trim(), latitude: parseCoordinate(latitude), longitude: parseCoordinate(longitude) }
    const nextErrors = validateShip(input)
    setErrors(nextErrors)
    setError(null)
    if (Object.keys(nextErrors).length) {
      if (nextErrors.name) nameRef.current?.focus()
      else if (nextErrors.latitude) latitudeRef.current?.focus()
      else longitudeRef.current?.focus()
      return
    }
    setSaving(true)
    try { await onSave(input) }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o navio. Tente novamente.')
      setSaving(false)
    }
  }

  return <Modal title={ship ? 'Editar navio' : 'Novo navio'} onClose={onCancel} busy={saving}>
    <p className="muted form-intro">Informe o nome e a posição geográfica do navio.</p>
    <form onSubmit={event => void submit(event)} noValidate className="ship-form">
      <div className="field"><label htmlFor={formId + '-name'}>Nome do navio</label>
        <input ref={nameRef} id={formId + '-name'} value={name} onChange={event => { setName(event.target.value); setErrors(current => ({ ...current, name: undefined })) }} maxLength={80} autoFocus autoComplete="off" placeholder="Ex.: Atlântico" disabled={saving} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? formId + '-name-error' : undefined} />
        {errors.name ? <p className="field-error" id={formId + '-name-error'} role="alert">{errors.name}</p> : null}
      </div>
      <div className="coordinate-fields">
        <div className="field"><label htmlFor={formId + '-latitude'}>Latitude</label>
          <input ref={latitudeRef} id={formId + '-latitude'} type="text" value={latitude} onChange={event => { setLatitude(event.target.value); setErrors(current => ({ ...current, latitude: undefined })) }} placeholder="-12,3456" autoComplete="off" disabled={saving} aria-invalid={Boolean(errors.latitude)} aria-describedby={formId + '-latitude-hint' + (errors.latitude ? ' ' + formId + '-latitude-error' : '')} />
          <span className="field-hint" id={formId + '-latitude-hint'}>De -90 a 90</span>
          {errors.latitude ? <p className="field-error" id={formId + '-latitude-error'} role="alert">{errors.latitude}</p> : null}
        </div>
        <div className="field"><label htmlFor={formId + '-longitude'}>Longitude</label>
          <input ref={longitudeRef} id={formId + '-longitude'} type="text" value={longitude} onChange={event => { setLongitude(event.target.value); setErrors(current => ({ ...current, longitude: undefined })) }} placeholder="-38,1234" autoComplete="off" disabled={saving} aria-invalid={Boolean(errors.longitude)} aria-describedby={formId + '-longitude-hint' + (errors.longitude ? ' ' + formId + '-longitude-error' : '')} />
          <span className="field-hint" id={formId + '-longitude-hint'}>De -180 a 180</span>
          {errors.longitude ? <p className="field-error" id={formId + '-longitude-error'} role="alert">{errors.longitude}</p> : null}
        </div>
      </div>
      <p className="form-tip">Use ponto ou vírgula decimal. Coordenadas ao sul e a oeste recebem sinal negativo.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onCancel} disabled={saving}>Cancelar</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar navio'}</button></div>
    </form>
  </Modal>
}


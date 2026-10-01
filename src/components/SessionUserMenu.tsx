import { useEffect, useId, useState } from 'react'
import type { SessionUser, SessionUserService } from '../services/sessionUserService'
import { Icon } from './Icon'

export function SessionUserMenu({ service }: { service: SessionUserService }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [photo, setPhoto] = useState<string | null>(null)
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)
  const panelId = useId()
  const titleId = useId()
  useEffect(() => {
    let active = true
    service.getUser().then(user => {
      if (!active) return
      setUser(user)
      setLoading(false)
      return service.getPhoto(user).then(photo => { if (active) setPhoto(photo) })
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [service])
  const avatar = <span className="user-avatar" aria-hidden="true">{photo && photo !== failedPhoto
    ? <img src={photo} alt="" onError={() => setFailedPhoto(photo)} /> : <Icon name="user" size={22} />}</span>
  return <>
    <button className="session-user" popoverTarget={panelId} aria-label="Ver usuário da sessão" aria-busy={loading}>
      {avatar}<span className="session-user-text"><strong>{loading ? 'Carregando perfil…' : user?.name || 'Perfil indisponível'}</strong><span>{user?.email || (loading ? 'Usuário da sessão' : 'Ver detalhes')}</span></span>
    </button>
    <section className="user-popover" id={panelId} popover="auto" role="region" aria-labelledby={titleId}>
      <div className="user-popover-heading"><h2 id={titleId}>Usuário da sessão</h2><button className="icon-button" popoverTarget={panelId} popoverTargetAction="hide" aria-label="Fechar perfil"><Icon name="close" size={18} /></button></div>
      {user ? <div className="user-popover-details">{avatar}<div><strong>{user.name}</strong><p>{user.email || 'E-mail não informado'}</p></div></div> : <p className="muted">{loading ? 'Carregando seu perfil…' : 'Não foi possível carregar o perfil. Atualize o aplicativo para tentar novamente.'}</p>}
    </section>
  </>
}
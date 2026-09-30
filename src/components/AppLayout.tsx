import { useEffect, useRef, type ReactNode } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Icon } from './Icon'

export type View = 'map' | 'ships'

function Navigation({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return <nav aria-label="Navegação principal" className="navigation">
    <p className="nav-label">EXPLORAR</p>
    <button className={view === 'map' ? 'nav-item active' : 'nav-item'} aria-current={view === 'map' ? 'page' : undefined} onClick={() => onNavigate('map')}>
      <Icon name="map" /><span>Mapa</span><span className="nav-active-dot" />
    </button>
    <button className={view === 'ships' ? 'nav-item active' : 'nav-item'} aria-current={view === 'ships' ? 'page' : undefined} onClick={() => onNavigate('ships')}>
      <Icon name="ship" /><span>Navios</span><span className="nav-active-dot" />
    </button>
  </nav>
}

export function AppLayout({ view, onNavigate, children }: { view: View; onNavigate: (view: View) => void; children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const drawer = useRef<HTMLDialogElement>(null)
  const content = useRef<HTMLElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 901px)')
    const close = () => { if (media.matches) drawer.current?.close() }
    media.addEventListener('change', close)
    return () => media.removeEventListener('change', close)
  }, [])
  const navigate = (next: View) => {
    onNavigate(next)
    content.current?.scrollTo({ top: 0, left: 0 })
    drawer.current?.close()
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <header className="app-header">
      <div className="header-brand">
        <button className="icon-button mobile-menu" aria-label="Abrir menu" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()}><Icon name="menu" /></button>
        <span className="brand-icon"><Icon name="ship" size={25} /></span>
        <div><h1>Navios</h1><span className="brand-subtitle">GESTÃO MARÍTIMA</span></div>
      </div>
      <div className="header-meta"><span className="demo-pill"><span />Dados de demonstração</span><span className="app-version">v1.1.0</span></div>
    </header>
    <aside className="desktop-sidebar">
      <Navigation view={view} onNavigate={navigate} />
      <div className="sidebar-note"><Icon name="anchor" size={25} /><strong>Uma visão do litoral</strong><p>Explore as posições e organize sua frota em um só lugar.</p><span>BRASIL · ATLÂNTICO SUL</span></div>
    </aside>
    <dialog className="nav-drawer" ref={drawer} aria-label="Menu de navegação" onClick={event => { if (event.target === event.currentTarget) drawer.current?.close() }}>
      <div className="drawer-header"><strong>Navios</strong><button className="icon-button" aria-label="Fechar menu" onClick={() => drawer.current?.close()}><Icon name="close" /></button></div>
      <Navigation view={view} onNavigate={navigate} />
    </dialog>
    <main ref={content} id="main-content" className="main-content" tabIndex={-1}>{children}</main>
    <button className="theme-toggle" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={toggleTheme}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} /><span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
    </button>
  </div>
}


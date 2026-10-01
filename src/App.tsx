import { lazy, Suspense, useState } from 'react'
import { AppLayout, type View } from './components/AppLayout'
import { useShips } from './context/ShipsContext'
import ShipsPage from './pages/ShipsPage'
import './App.css'

const MapPage = lazy(() => import('./pages/MapPage'))

import type { SessionUserService } from './services/sessionUserService'

function App({ sessionService }: { sessionService: SessionUserService }) {
  const [view, setView] = useState<View>('map')
  const { error, reload } = useShips()
  return <AppLayout sessionService={sessionService} view={view} onNavigate={setView}>
    {error ? <div className="error-banner" role="alert">{error}<button className="button secondary" onClick={() => void reload()}>Tentar novamente</button></div> : null}
    {view === 'map' ? <Suspense fallback={<p className="muted" role="status">Carregando mapa…</p>}><MapPage /></Suspense> : <ShipsPage />}
  </AppLayout>
}
export default App


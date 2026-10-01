import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider'
import { ShipsProvider } from './context/ShipsProvider'
import { createDataverseShipService } from './services/dataverseShipService'

async function startApp() {
  // O modo test usa dados isolados; development e production sempre usam Dataverse.
  const shipService = import.meta.env.MODE === 'test'
    ? (await import('./services/mockShipService')).createMockShipService()
    : createDataverseShipService((await import('./services/dataverseShipClient')).dataverseShipClient)

  const sessionService = import.meta.env.MODE === 'test'
    ? (await import('./services/mockSessionUserService')).mockSessionUserService
    : (await import('./services/sessionUserClient')).sessionUserService

  createRoot(document.getElementById('root')!).render(
    <StrictMode><ThemeProvider><ShipsProvider service={shipService}><App sessionService={sessionService} /></ShipsProvider></ThemeProvider></StrictMode>,
  )
}

void startApp()

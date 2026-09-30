import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider'
import { ShipsProvider } from './context/ShipsProvider'
import { createMockShipService } from './services/mockShipService'

// Único ponto de composição: trocar este adaptador quando houver a integração Dataverse.
const shipService = createMockShipService()

createRoot(document.getElementById('root')!).render(
  <StrictMode><ThemeProvider><ShipsProvider service={shipService}><App /></ShipsProvider></ThemeProvider></StrictMode>,
)


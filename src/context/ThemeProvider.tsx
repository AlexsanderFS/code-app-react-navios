import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'

function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem('navios.theme.v1')
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* O tema continua funcionando quando o navegador bloqueia o armazenamento. */ }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('navios.theme.v1', theme) } catch { /* Preferencia desta sessao. */ }
  }, [theme])
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }}>
    {children}
  </ThemeContext.Provider>
}


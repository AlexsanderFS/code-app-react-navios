import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'
export const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme precisa de ThemeProvider.')
  return context
}


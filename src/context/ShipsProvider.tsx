import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ShipsContext } from './ShipsContext'
import type { ShipService } from '../services/shipService'
import type { Ship, ShipInput } from '../types/ship'

export function ShipsProvider({ service, children }: { service: ShipService; children: ReactNode }) {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    service.list().then(result => {
      if (active) { setShips(result); setLoading(false) }
    }).catch((reason: unknown) => {
      if (active) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os navios.'); setLoading(false) }
    })
    return () => { active = false }
  }, [service])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setShips(await service.list()) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os navios.') }
    finally { setLoading(false) }
  }, [service])

  const create = async (input: ShipInput) => {
    const ship = await service.create(input)
    setShips(current => [...current, ship])
    return ship
  }
  const update = async (id: string, input: ShipInput) => {
    const ship = await service.update(id, input)
    setShips(current => current.map(currentShip => currentShip.id === id ? ship : currentShip))
    return ship
  }
  const setState = async (id: string, stateCode: Ship['stateCode']) => {
    const ship = await service.setState(id, stateCode)
    setShips(current => current.map(currentShip => currentShip.id === id ? ship : currentShip))
    return ship
  }
  const remove = async (id: string) => {
    await service.remove(id)
    setShips(current => current.filter(ship => ship.id !== id))
  }
  return <ShipsContext.Provider value={{ ships, loading, error, reload, create, update, setState, remove }}>{children}</ShipsContext.Provider>
}


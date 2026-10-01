import { useEffect, useRef, useState } from 'react'
import { divIcon, DomEvent, latLngBounds, type LatLngBoundsExpression, type Marker as LeafletMarker } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useShips } from '../context/ShipsContext'
import { formatCoordinate } from '../domain/shipValidation'
import { Icon } from '../components/Icon'
import { hasValidPosition, type PositionedShip } from '../types/ship'

const brazilBounds: LatLngBoundsExpression = [[-34, -74], [6, -28]]
const shipIcon = divIcon({
  className: 'ship-map-icon',
  html: '<span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v5M8 8V5h8v3M5 13V8h14v5M3 14l9-4 9 4-3 6H6zM2 21q2-2 4 0t4 0t4 0t4 0t4 0"/></svg></span>',
  iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -20], tooltipAnchor: [0, 0],
})

function MapControls({ ships, onTileError }: { ships: PositionedShip[]; onTileError: (failed: boolean) => void }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  const controls = useRef<HTMLDivElement>(null)
  const zoomControls = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (controls.current) DomEvent.disableClickPropagation(controls.current)
    if (zoomControls.current) DomEvent.disableClickPropagation(zoomControls.current)
  }, [])
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  useEffect(() => {
    map.fitBounds(brazilBounds, { padding: [20, 20], animate: false })
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  function fitFleet() {
    if (ships.length) map.fitBounds(latLngBounds(ships.map(ship => [ship.latitude, ship.longitude])), { padding: [62, 62], maxZoom: 7 })
  }
  return <>
    <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} eventHandlers={{ tileerror: () => onTileError(true), tileload: () => onTileError(false) }} />
    <div className="map-controls" ref={controls}>
      <button className="map-control-button" onClick={() => map.fitBounds(brazilBounds, { padding: [20, 20] })}><Icon name="map" size={16} />Brasil</button>
      <button className="map-control-button" disabled={!ships.length} onClick={fitFleet}><Icon name="focus" size={16} />Ver frota</button>
    </div>
    <div className="map-zoom" ref={zoomControls} role="group" aria-label="Zoom do mapa">
      <button aria-label="Aproximar mapa" disabled={zoom >= 19} onClick={() => map.zoomIn()}><Icon name="plus" /></button>
      <button aria-label="Afastar mapa" disabled={zoom <= 2} onClick={() => map.zoomOut()}><span aria-hidden="true">−</span></button>
    </div>
    <span className="map-zoom-level" aria-live="polite">Zoom {zoom}</span>
  </>
}

function ShipMarker({ ship, selected, selectionVersion, onSelect }: { ship: PositionedShip; selected: boolean; selectionVersion: number; onSelect: () => void }) {
  const map = useMap()
  const marker = useRef<LeafletMarker>(null)
  useEffect(() => {
    if (selected) {
      map.setView([ship.latitude, ship.longitude], map.getZoom(), { animate: false })
      marker.current?.openPopup()
    }
  }, [selected, selectionVersion, ship.latitude, ship.longitude, map])
  return <Marker ref={marker} position={[ship.latitude, ship.longitude]} icon={shipIcon} title={ship.name} alt={ship.name} eventHandlers={{ click: onSelect }} zIndexOffset={selected ? 1000 : 0}>
    <Tooltip permanent direction="auto" offset={[0, 0]} className="ship-tooltip">{ship.name}</Tooltip>
    <Popup minWidth={190} maxWidth={250} autoPanPaddingTopLeft={[14, 110]} autoPanPaddingBottomRight={[64, 24]}><div className="ship-popup"><h3>{ship.name}</h3><dl>
      <div><dt>Latitude</dt><dd>{formatCoordinate(ship.latitude)}</dd></div>
      <div><dt>Longitude</dt><dd>{formatCoordinate(ship.longitude)}</dd></div>
    </dl></div></Popup>
  </Marker>
}

export default function MapPage() {
  const { ships, loading, error, reload } = useShips()
  const activeShips = ships.filter(ship => ship.stateCode === 0)
  const positionedShips = activeShips.filter(hasValidPosition)
  const [selection, setSelection] = useState<{ id: string; version: number } | null>(null)
  const selectedId = selection?.id
  function selectShip(id: string) { setSelection(current => ({ id, version: (current?.version ?? 0) + 1 })) }
  const [tileError, setTileError] = useState(false)
  return <>
    <div className="page-heading">
      <div><h2>Mapa da frota</h2><p className="muted">Seu ponto de vista sobre o litoral brasileiro.</p></div>
      <div className="page-actions"><button className="button secondary" onClick={() => void reload()} disabled={loading}>Atualizar lista</button><span className="fleet-count"><Icon name="ship" size={18} /><strong>{activeShips.length}</strong> {activeShips.length === 1 ? 'ativo' : 'ativos'}</span></div>
    </div>
    <div className="map-workspace">
      <section className="map-section panel" aria-label="Mapa de navios">
        <div className="map-topbar"><span><span className="status-dot" />Brasil e litoral brasileiro</span><span>POSIÇÕES CADASTRADAS</span></div>
        <div className="map-canvas">
          <MapContainer bounds={brazilBounds} className="fleet-map" zoomControl={false} minZoom={2} maxZoom={19} scrollWheelZoom>
            <MapControls ships={positionedShips} onTileError={setTileError} />
            {positionedShips.map(ship => <ShipMarker key={ship.id} ship={ship} selected={selectedId === ship.id} selectionVersion={selection?.version ?? 0} onSelect={() => selectShip(ship.id)} />)}
          </MapContainer>
          {tileError ? <div className="tile-warning" role="status">Não foi possível carregar parte do mapa. Verifique sua conexão. Os dados dos navios continuam disponíveis na lista.</div> : null}
        </div>
        <div className="map-caption"><span><span className="legend-dot" />Navios ativos</span><span>Arraste para navegar · Use + e − para aproximar</span></div>
      </section>
      <section className="fleet-overview" aria-labelledby="fleet-title">
        <div className="section-heading"><h3 id="fleet-title">Ativos na sua frota</h3><span className="muted">Selecione para localizar no mapa</span></div>
        {loading ? <p className="muted" role="status">Carregando navios…</p> : error ? <p className="muted" role="status">Não foi possível atualizar a frota.</p> : ships.length === 0 ? <div className="panel empty-state"><Icon name="ship" size={28} /><h3>Sua frota começa aqui</h3><p className="muted">Abra Navios no menu para cadastrar o primeiro navio.</p></div> : activeShips.length === 0 ? <div className="panel empty-state"><Icon name="ship" size={28} /><h3>Nenhum navio ativo</h3><p className="muted">Abra Navios no menu para reativar um navio da sua frota.</p></div> :
          <div className="fleet-cards">{activeShips.map(ship => <button key={ship.id} className={selectedId === ship.id ? 'fleet-card selected' : 'fleet-card'} disabled={!hasValidPosition(ship)} aria-label={hasValidPosition(ship) ? 'Localizar ' + ship.name : ship.name + ' sem posição válida'} aria-pressed={selectedId === ship.id} onClick={() => {
            selectShip(ship.id)
            document.querySelector('.map-section')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' })
          }}><span className="card-icon"><Icon name="ship" /></span><div><strong>{ship.name}</strong>{!hasValidPosition(ship) ? <p className="muted">Complete as coordenadas em Navios para localizar no mapa.</p> : null}<div className="fleet-coordinates"><span className="fleet-coordinate"><small>Latitude</small><span>{formatCoordinate(ship.latitude)}</span></span><span className="fleet-coordinate"><small>Longitude</small><span>{formatCoordinate(ship.longitude)}</span></span></div></div><Icon name="arrow" size={18} /></button>)}</div>}
      </section>
    </div>
  </>
}
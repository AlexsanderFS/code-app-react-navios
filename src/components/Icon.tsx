import type { CSSProperties } from 'react'

export type IconName = 'ship' | 'map' | 'menu' | 'close' | 'sun' | 'moon' | 'plus' | 'edit' | 'trash' | 'focus' | 'arrow' | 'anchor'
const paths: Record<IconName, string> = {
  ship: 'M12 3v5 M8 8V5h8v3 M5 13V8h14v5 M3 14l9-4 9 4-3 6H6z M2 21q2-2 4 0t4 0t4 0t4 0t4 0',
  map: 'M9 4L3 6v15l6-2 6 2 6-2V4l-6 2z M9 4v15 M15 6v15',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M6 6l12 12 M18 6L6 18',
  sun: 'M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M5.6 5.6L4.2 4.2 M19.8 19.8l-1.4-1.4 M5.6 18.4l-1.4 1.4 M19.8 4.2l-1.4 1.4 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  moon: 'M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13z',
  plus: 'M12 5v14 M5 12h14',
  edit: 'M16 3l5 5-12 12-6 1 1-6z M14 5l5 5',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  focus: 'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  anchor: 'M14 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M12 7v14 M7 11h10 M3 15v2a9 9 0 0 0 18 0v-2 M3 15l3 2 M21 15l-3 2',
}

export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>
}


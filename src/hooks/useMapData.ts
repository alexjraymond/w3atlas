// src/hooks/useMapData.ts
import { useState, useEffect } from 'react'
import type { MapData } from '../types/maps'

export function useMapData(mapSlug: string) {
  const [data, setData] = useState<MapData | null>(null)

  useEffect(() => {
    let cancelled = false

    const slug = mapSlug.toLowerCase().replace(/\s+/g, '_')
    fetch(`/maps/${slug}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${slug}.json: ${res.statusText}`)
        return res.json()
      })
      .then((json: MapData) => {
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        console.error(err)
      })

    return () => {
      cancelled = true
    }
  }, [mapSlug])

  return data
}

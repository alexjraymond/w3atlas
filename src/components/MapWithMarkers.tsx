import React from 'react'
import { Center, Loader } from '@mantine/core'
import { useMapData } from '../hooks/useMapData'
import type { Camp } from '../types/maps'

const MARKER_SIZE = 30

export function MapWithMarkers({ mapSlug }: { mapSlug: string }) {
  const data = useMapData(mapSlug)
  const slug = mapSlug.toLowerCase().replace(/\s+/g, '_')
  const imgUrl = `/maps/${slug}.png`

  // While loading, show a centered spinner
  if (!data) {
    return (
      <Center style={{ width: '100%', paddingTop: 16 }}>
        <Loader />
      </Center>
    )
  }

  // Once data is available, unpack dimensions and camps
  const {
    dimensions: { width: W, height: H },
    camps,
  } = data

  // Maintain aspect ratio using padding-top hack
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingTop: `${(H / W) * 100}%`,
    overflow: 'hidden',
  }

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }

  return (
    <div style={containerStyle}>
      <img
        src={imgUrl}
        alt={mapSlug}
        style={imgStyle}
        onError={() => console.error('Failed to load map image:', imgUrl)}
      />

      {camps.map((camp: Camp) => {
        // Compute relative position percentages
        const leftPct = (camp.position.x / W) * 100
        const topPct = (camp.position.y / H) * 100
        // Compute marker size as a percentage of width
        const sizePct = (MARKER_SIZE / W) * 100

        return (
          <div
            key={camp.id}
            style={{
              position: 'absolute',
              top: `${topPct}%`,
              left: `${leftPct}%`,
              width: `${sizePct}%`,
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: camp.id.startsWith('green')
                ? 'rgba(0,200,0,0.5)'
                : 'rgba(255,165,0,0.5)',
              cursor: 'pointer',
            }}
            onMouseEnter={() => {/* show tooltip */}}
            onMouseLeave={() => {/* hide tooltip */}}
          />
        )
      })}
    </div>
  )
}

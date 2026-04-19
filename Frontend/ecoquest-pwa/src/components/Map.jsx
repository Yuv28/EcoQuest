import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Map({ center = [32.7157, -117.1611], zoom = 12, markers = [] }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-2xl"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]}>
          <Popup>
            <div className="font-body text-sm">
              <strong>{m.name}</strong>
              {m.species && <p className="text-xs text-gray-500 italic">{m.species}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_CONFIG } from '../../types';
import { useRoads } from '../../context/RoadContext';

// Fix for default marker icon in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const OVACIK_CENTER: [number, number] = [39.3596, 39.2084];

const MapCanvas = () => {
    const { roads } = useRoads();

    return (
        <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
            <MapContainer
                center={OVACIK_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={OVACIK_CENTER}>
                    <Popup>
                        <strong>Ovacık Belediyesi</strong><br />
                        Merkez Binası
                    </Popup>
                </Marker>

                {roads.map((road) => (
                    <Polyline
                        key={road.id}
                        positions={road.coordinates}
                        pathOptions={{ color: STATUS_CONFIG[road.status].color, weight: 5, opacity: 0.8 }}
                    >
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: 'var(--color-primary)' }}>{road.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: STATUS_CONFIG[road.status].color
                                    }} />
                                    <strong>{STATUS_CONFIG[road.status].label}</strong>
                                </div>
                                <small style={{ color: '#666' }}>Son Güncelleme: {new Date(road.lastUpdated).toLocaleDateString("tr-TR")}</small>
                            </div>
                        </Popup>
                    </Polyline>
                ))}
            </MapContainer>


        </div>
    );
};

export default MapCanvas;

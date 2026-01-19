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

            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '300px',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Yol Durum Bilgisi</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Harita üzerinden yolların açık/kapalı durumunu görüntüleyebilirsiniz.
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--color-success)', color: 'white', borderRadius: '4px' }}>Açık</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--color-danger)', color: 'white', borderRadius: '4px' }}>Kapalı</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--color-warning)', color: 'white', borderRadius: '4px' }}>Çalışma Var</span>
                </div>
            </div>
        </div>
    );
};

export default MapCanvas;

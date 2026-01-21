import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
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

const createCameraIcon = (count: number) => divIcon({
    className: 'custom-camera-icon',
    html: `<div style="
        background-color: white; 
        border: 2px solid var(--color-primary); 
        border-radius: 50%; 
        width: 30px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
        <span style="font-size: 16px;">📷</span>
        ${count > 1 ? `<span style="
            position: absolute; 
            top: -5px; 
            right: -5px; 
            background: red; 
            color: white; 
            border-radius: 50%; 
            width: 16px; 
            height: 16px; 
            font-size: 10px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-weight: bold;
        ">${count}</span>` : ''}
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const MapCanvas = () => {
    const { roads } = useRoads();

    // Helper to find visual center of a polyline
    const getCenter = (coords: [number, number][]) => {
        if (!coords || coords.length === 0) return OVACIK_CENTER;
        const midIndex = Math.floor(coords.length / 2);
        return coords[midIndex];
    };

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
                    <div key={road.id}>
                        <Polyline
                            positions={road.coordinates}
                            pathOptions={{ color: STATUS_CONFIG[road.status].color, weight: 12, opacity: 0.8 }}
                        >
                            <Popup>
                                <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)', fontSize: '18px' }}>{road.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: STATUS_CONFIG[road.status].color
                                        }} />
                                        <strong style={{ fontSize: '16px' }}>{STATUS_CONFIG[road.status].label}</strong>
                                    </div>
                                    <small style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                                        Son Güncelleme: {new Date(road.lastUpdated).toLocaleDateString("tr-TR")}
                                    </small>

                                    {road.images && road.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
                                            {road.images.map((img, idx) => (
                                                <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={img.url}
                                                        alt={`${road.name} - ${idx + 1}`}
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Polyline>

                        {/* Camera Icon for roads with images */}
                        {road.images && road.images.length > 0 && (
                            <Marker
                                position={getCenter(road.coordinates)}
                                icon={createCameraIcon(road.images.length)}
                            >
                                <Popup>
                                    <strong>{road.name}</strong>
                                    <br />
                                    {road.images.length} fotoğraf var.
                                </Popup>
                            </Marker>
                        )}
                    </div>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapCanvas;

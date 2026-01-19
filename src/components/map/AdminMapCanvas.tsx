import { MapContainer, TileLayer, FeatureGroup, Polyline, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useRoads } from '../../context/RoadContext';
import { STATUS_CONFIG } from '../../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Common Ovacık Center
const OVACIK_CENTER: [number, number] = [39.3596, 39.2084];

const AdminMapCanvas = () => {
    const { roads, addRoad, deleteRoad, updateRoadName, updateRoadStatus } = useRoads();

    const _onCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polyline') {
            const latlngs = layer.getLatLngs();
            // Convert LatLng[] to [number, number][]
            const coordinates: [number, number][] = latlngs.map((ll: any) => [ll.lat, ll.lng]);

            const name = prompt("Yeni yolun adı nedir?", "Yeni Yol");
            if (!name) return; // Cancelled

            addRoad({
                name: name,
                status: 'OPEN', // Default status
                coordinates: coordinates
            });

            // Remove the drawn layer from the map immediately, as it will be re-rendered by the state update
            layer.remove();
        }
    };

    const _onDeleted = (e: any) => {
        console.log("Deleted via toolbar", e);
    };

    return (
        <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <strong>Editör Modu</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                    Üst soldaki araç çubuğunu kullanarak çizgi çizebilirsiniz.
                </p>
            </div>

            <MapContainer
                center={OVACIK_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FeatureGroup>
                    <EditControl
                        position="topleft"
                        onCreated={_onCreated}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: false,
                            polygon: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: {
                                shapeOptions: {
                                    color: '#2563eb',
                                    weight: 4
                                }
                            }
                        }}
                    />
                </FeatureGroup>

                {roads.map((road) => (
                    <Polyline
                        key={road.id}
                        positions={road.coordinates}
                        pathOptions={{ color: STATUS_CONFIG[road.status].color, weight: 6, opacity: 0.9 }}
                    >
                        <Popup>
                            <div>
                                <strong>{road.name}</strong>
                                <br />
                                Durum: {STATUS_CONFIG[road.status].label}
                                <hr style={{ margin: '8px 0' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, fontSize: '10px', padding: '4px', background: STATUS_CONFIG['OPEN'].color, color: 'white' }}
                                            onClick={() => updateRoadStatus(road.id, 'OPEN')}
                                        >
                                            Açık
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, fontSize: '10px', padding: '4px', background: STATUS_CONFIG['CLOSED'].color, color: 'white' }}
                                            onClick={() => updateRoadStatus(road.id, 'CLOSED')}
                                        >
                                            Kapalı
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, fontSize: '10px', padding: '4px', background: STATUS_CONFIG['WORK'].color, color: 'white' }}
                                            onClick={() => updateRoadStatus(road.id, 'WORK')}
                                        >
                                            Çalışma
                                        </button>
                                    </div>
                                    <button
                                        className="btn"
                                        style={{ fontSize: '12px', padding: '4px' }}
                                        onClick={() => {
                                            const newName = prompt("Yol ismini düzenle:", road.name);
                                            if (newName) updateRoadName(road.id, newName);
                                        }}
                                    >
                                        İsim Düzenle
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ fontSize: '12px', padding: '4px', background: 'var(--color-danger)', color: 'white' }}
                                        onClick={() => {
                                            if (confirm(`${road.name} silinsin mi?`)) deleteRoad(road.id);
                                        }}
                                    >
                                        Yolu Sil
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminMapCanvas;

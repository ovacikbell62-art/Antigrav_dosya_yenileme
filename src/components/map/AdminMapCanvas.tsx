import { MapContainer, TileLayer, FeatureGroup, Polyline, Popup, Marker } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useRef, useState } from 'react';
import { useRoads } from '../../context/RoadContext';
import { STATUS_CONFIG } from '../../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { divIcon } from 'leaflet';

import { useAuth } from '../../context/AuthContext';

// Common Ovacık Center
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

const AdminMapCanvas = () => {
    const { roads, addRoad, deleteRoad, updateRoadName, updateRoadStatus, deleteRoadImage, uploadRoadImage } = useRoads();
    const { isSuperAdmin } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedRoadId) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                await uploadRoadImage(selectedRoadId, file);
                alert("Fotoğraf başarıyla yüklendi!");
            } catch (error) {
                console.error("Upload failed", error);
                alert("Yükleme başarısız oldu.");
            } finally {
                setUploading(false);
                setSelectedRoadId(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const getCenter = (coords: [number, number][]) => {
        if (!coords || coords.length === 0) return OVACIK_CENTER;
        const midIndex = Math.floor(coords.length / 2);
        return coords[midIndex];
    };

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
                coordinates: coordinates,
                images: []
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
                {uploading && (
                    <div style={{ marginTop: '10px', color: 'blue', fontWeight: 'bold' }}>
                        Fotoğraf Yükleniyor...
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileSelect}
            />

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
                    <div key={road.id}>
                        <Polyline
                            positions={road.coordinates}
                            pathOptions={{ color: STATUS_CONFIG[road.status].color, weight: 12, opacity: 0.9 }}
                        >
                            <Popup>
                                <div style={{ minWidth: '220px', maxWidth: '320px' }}>
                                    <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>{road.name}</strong>

                                    <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                                        Durum: <strong>{STATUS_CONFIG[road.status].label}</strong>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* Status Buttons */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '8px', fontSize: '14px', background: STATUS_CONFIG['OPEN'].color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                onClick={() => updateRoadStatus(road.id, 'OPEN')}
                                            >
                                                Açık
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '8px', fontSize: '14px', background: STATUS_CONFIG['CLOSED'].color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                onClick={() => updateRoadStatus(road.id, 'CLOSED')}
                                            >
                                                Kapalı
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '8px', fontSize: '14px', background: STATUS_CONFIG['WORK'].color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                onClick={() => updateRoadStatus(road.id, 'WORK')}
                                            >
                                                Çalışma
                                            </button>
                                        </div>

                                        {/* Image Management */}
                                        <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '10px 0', margin: '5px 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <strong style={{ fontSize: '14px' }}>Fotoğraflar</strong>
                                                <button
                                                    style={{ padding: '4px 8px', fontSize: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedRoadId(road.id);
                                                        setTimeout(() => fileInputRef.current?.click(), 100);
                                                    }}
                                                    disabled={uploading}
                                                >
                                                    {uploading && selectedRoadId === road.id ? '...' : '+ Foto'}
                                                </button>
                                            </div>

                                            {road.images && road.images.length > 0 ? (
                                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                                                    {road.images.map((img, idx) => (
                                                        <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                                            <a href={img.url} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={img.url}
                                                                    alt="foto"
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                                />
                                                            </a>
                                                            {isSuperAdmin && (
                                                                <div style={{ fontSize: '9px', color: '#555', marginTop: '2px', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`Ekleyen: ${img.addedBy}\nTarih: ${new Date(img.date).toLocaleString('tr-TR')}`}>
                                                                    {img.addedBy}
                                                                </div>
                                                            )}
                                                            <button
                                                                style={{
                                                                    position: 'absolute', top: -5, right: -5,
                                                                    background: 'red', color: 'white',
                                                                    width: '18px', height: '18px',
                                                                    borderRadius: '50%', border: 'none',
                                                                    cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm("Bu fotoğrafı silmek istiyor musunuz?")) deleteRoadImage(road.id, img.url);
                                                                }}
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <small style={{ color: '#888', fontStyle: 'italic' }}>Henüz fotoğraf yok.</small>
                                            )}
                                        </div>

                                        {/* Edit Actions */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn"
                                                style={{ flex: 1, padding: '8px', fontSize: '14px', background: '#f3f4f6', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    const newName = prompt("Yol ismini düzenle:", road.name);
                                                    if (newName) updateRoadName(road.id, newName);
                                                }}
                                            >
                                                İsim Düzenle
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ flex: 1, padding: '8px', fontSize: '14px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (confirm(`${road.name} silinsin mi?`)) deleteRoad(road.id);
                                                }}
                                            >
                                                Yolu Sil
                                            </button>
                                        </div>
                                    </div>
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
                                    <strong>{road.name}</strong><br />
                                    {road.images.length} fotoğraf.
                                </Popup>
                            </Marker>
                        )}
                    </div>
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminMapCanvas;

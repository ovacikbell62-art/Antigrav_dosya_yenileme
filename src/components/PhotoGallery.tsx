import { useState } from 'react';
import { useRoads } from '../context/RoadContext';
import { Trash2, Camera } from 'lucide-react';

const PhotoGallery = () => {
    const { roads, deleteRoadImage } = useRoads();
    const [selectedPhotos, setSelectedPhotos] = useState<{ roadId: string, url: string }[]>([]);

    // Flatten all photos from all roads
    const allPhotos = roads.flatMap(road =>
        (road.images || []).map(img => ({
            roadId: road.id,
            roadName: road.name,
            url: img.url,
            addedBy: img.addedBy,
            date: img.date
        }))
    );

    const toggleSelect = (roadId: string, url: string) => {
        const exists = selectedPhotos.find(p => p.roadId === roadId && p.url === url);
        if (exists) {
            setSelectedPhotos(prev => prev.filter(p => !(p.roadId === roadId && p.url === url)));
        } else {
            setSelectedPhotos(prev => [...prev, { roadId, url }]);
        }
    };

    const handleSelectAll = () => {
        if (selectedPhotos.length === allPhotos.length) {
            setSelectedPhotos([]);
        } else {
            setSelectedPhotos(allPhotos.map(p => ({ roadId: p.roadId, url: p.url })));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`${selectedPhotos.length} fotoğrafı silmek istediğinize emin misiniz?`)) return;

        // Process sequentially to avoid race conditions or overwhelming the server
        for (const photo of selectedPhotos) {
            await deleteRoadImage(photo.roadId, photo.url);
        }

        setSelectedPhotos([]);
        alert("Seçilen fotoğraflar silindi.");
    };

    if (allPhotos.length === 0) {
        return <div style={{ color: '#666', fontStyle: 'italic', padding: '1rem' }}>Sistemde hiç fotoğraf bulunmuyor.</div>;
    }

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <h2 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Camera size={24} /> Fotoğraf Galerisi ({allPhotos.length})
                </h2>

                {selectedPhotos.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-danger)', color: 'white' }}
                    >
                        <Trash2 size={16} /> Seçilenleri Sil ({selectedPhotos.length})
                    </button>
                )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                        type="checkbox"
                        checked={selectedPhotos.length === allPhotos.length && allPhotos.length > 0}
                        onChange={handleSelectAll}
                    />
                    Tümünü Seç
                </label>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
            }}>
                {allPhotos.map((photo, idx) => {
                    const isSelected = !!selectedPhotos.find(p => p.roadId === photo.roadId && p.url === photo.url);
                    return (
                        <div key={`${photo.roadId}-${idx}`} style={{
                            position: 'relative',
                            border: isSelected ? '2px solid #2563eb' : '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'relative', paddingTop: '75%' }}>
                                <img
                                    src={photo.url}
                                    alt={photo.roadName}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(photo.roadId, photo.url)}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            <div style={{ padding: '0.5rem', fontSize: '11px', background: '#f8fafc' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {photo.roadName}
                                </div>
                                <div style={{ color: '#666' }}>
                                    {photo.addedBy || 'Bilinmiyor'}
                                </div>
                                <div style={{ color: '#999', fontSize: '10px' }}>
                                    {new Date(photo.date).toLocaleDateString(('tr-TR'))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhotoGallery;

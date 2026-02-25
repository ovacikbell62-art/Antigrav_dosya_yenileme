import { useAuth } from '../context/AuthContext';
import { useRoads } from '../context/RoadContext';
import { useAnnouncements } from '../context/AnnouncementContext';
import { STATUS_CONFIG } from '../types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Download, Upload, Database, Settings } from 'lucide-react';
import { supabase } from '../supabase';
import PhotoGallery from '../components/PhotoGallery';

interface Report {
    id: string;
    message: string;
    status: string;
    created_at: string;
}

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { roads, updateRoadStatus, updateAllRoadStatus, recoverFromLocalStorage, backupToLocalStorage } = useRoads();
    const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [hasLocalData, setHasLocalData] = useState(false);
    const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [showLocalKeys, setShowLocalKeys] = useState(false);
    const [recoverySummary, setRecoverySummary] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
            navigate('/login');
        } else {
            fetchReports();
            checkLegacyData();
        }
    }, [isAuthenticated, user, navigate]);

    const checkLegacyData = () => {
        const keys = ['roads', 'roads_backup', 'ovacik_roads', 'road_data', 'map_roads', 'layers', 'ovacik-roads'];
        const found = keys.some(key => {
            const data = localStorage.getItem(key);
            if (!data) return false;
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed.length > 0 : (parsed && (Array.isArray(parsed.roads) || Array.isArray(parsed.layers)));
            } catch (e) {
                return false;
            }
        });
        setHasLocalData(found);
    };

    const fetchReports = async () => {
        const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (data) setReports(data);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(roads, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `ovacik_yol_yedek_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    if (confirm(`${json.length} adet yol verisi içe aktarılacak. Mevcut olmayanlar eklenecek. Onaylıyor musunuz?`)) {
                        localStorage.setItem('roads_backup', JSON.stringify(json));
                        const result = await recoverFromLocalStorage();
                        alert(`${result.count} yeni yol başarıyla eklendi!`);
                    }
                }
            } catch (error) {
                alert("Geçersiz yedek dosyası!");
            }
        };
        reader.readAsText(file);
    };

    if (!user || user.role !== 'SUPER_ADMIN') return null; // Restrict entire diagnostic view or parts below

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {user.role === 'SUPER_ADMIN' && hasLocalData && recoveryStatus !== 'success' && (
                <div className="card" style={{ marginBottom: '2rem', background: '#fff9db', border: '1px solid #fab005', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertTriangle color="#f08c00" size={32} />
                        <div>
                            <strong style={{ display: 'block' }}>Eski Veriler Tespit Edildi! (Derin Tarama v2.0.7)</strong>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Tarayıcınızda farklı isimler altında kayıtlı yol verileri bulundu. Bunları koordinat karşılaştırması yaparak geri yüklemek ister misiniz?</p>
                        </div>
                    </div>
                    <button
                        className="btn"
                        style={{ background: '#f08c00', color: 'white' }}
                        disabled={recoveryStatus === 'loading'}
                        onClick={async () => {
                            setRecoveryStatus('loading');
                            const result = await recoverFromLocalStorage();
                            if (result.error) {
                                setRecoveryStatus('error');
                                alert("Veriler kurtarılırken bir hata oluştu.");
                            } else {
                                setRecoveryStatus('success');
                                alert(`${result.count} yeni yol başarıyla kurtarıldı!`);
                                setRecoverySummary(`${result.count} adet yeni yol veritabanına eklendi.`);
                                setHasLocalData(false);
                            }
                        }}
                    >
                        {recoveryStatus === 'loading' ? 'Yükleniyor...' : 'Verileri Kurtar'}
                    </button>
                </div>
            )}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    Yönetim Paneli
                </h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0 }}>Hoşgeldiniz, {user.username}. Buradan yol durumlarını güncelleyebilirsiniz.</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn"
                            style={{ background: 'var(--color-success)', color: 'white', fontSize: '0.9rem' }}
                            onClick={() => {
                                if (confirm('Tüm yolları AÇIK olarak işaretlemek istediğinize emin misiniz?')) {
                                    updateAllRoadStatus('OPEN');
                                }
                            }}
                        >
                            <CheckCircle size={16} /> Tümünü Aç
                        </button>
                        <button
                            className="btn"
                            style={{ background: 'var(--color-danger)', color: 'white', fontSize: '0.9rem' }}
                            onClick={() => {
                                if (confirm('Tüm yolları KAPALI olarak işaretlemek istediğinize emin misiniz?')) {
                                    updateAllRoadStatus('CLOSED');
                                }
                            }}
                        >
                            <XCircle size={16} /> Tümünü Kapat
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/map-editor')}
                        >
                            🗺️ Harita Düzenle (Yeni Yol Çiz)
                        </button>
                        {user.role === 'SUPER_ADMIN' && (
                            <button
                                className="btn"
                                style={{ background: '#6a1b9a', color: 'white', fontSize: '0.9rem' }}
                                onClick={() => navigate('/admin-logs')}
                            >
                                🛡️ Sistem Logları
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {user.role === 'SUPER_ADMIN' && (
                <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={20} color="var(--color-primary)" />
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Veri Yönetimi ve Yedekleme (Sadece Admin)</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowLocalKeys(!showLocalKeys)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings size={16} /> Sistem Bilgisi (Key'ler)
                            </button>
                            <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Yolları Yedekle (JSON)
                            </button>
                            <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Upload size={16} /> Yedek Yükle
                                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                    {showLocalKeys && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem' }}>
                            <strong>Tarayıcıdaki Tüm Anahtarlar:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {Object.keys(localStorage).map(key => (
                                    <span key={key} style={{ padding: '0.2rem 0.5rem', background: '#eee', borderRadius: '4px' }}>
                                        {key} ({localStorage.getItem(key)?.length || 0} byte)
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                        İpucu: Bu araçlar sadece 'admin' kullanıcısı için görünürdür. Koordinat bazlı kurtarma ile silinen yollar geri getirilirken isim çakışmaları sorun oluşturmaz.
                    </p>
                </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {roads.map(road => (
                    <div key={road.id} className="card" style={{ borderLeft: `4px solid ${STATUS_CONFIG[road.status].color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{road.name}</h3>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.2rem 0.6rem',
                                background: STATUS_CONFIG[road.status].color,
                                color: 'white',
                                borderRadius: 'var(--radius-full)'
                            }}>
                                {STATUS_CONFIG[road.status].label}
                            </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                            Son Güncelleme: {new Date(road.lastUpdated).toLocaleString('tr-TR')}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => updateRoadStatus(road.id, 'OPEN')}
                                disabled={road.status === 'OPEN'}
                                className="btn"
                                style={{
                                    flex: 1,
                                    fontSize: '0.8rem',
                                    padding: '0.5rem',
                                    background: road.status === 'OPEN' ? '#e2e8f0' : 'var(--color-success)',
                                    color: road.status === 'OPEN' ? '#94a3b8' : 'white',
                                    cursor: road.status === 'OPEN' ? 'default' : 'pointer'
                                }}
                            >
                                <CheckCircle size={14} /> Açık
                            </button>
                            <button
                                onClick={() => updateRoadStatus(road.id, 'CLOSED')}
                                disabled={road.status === 'CLOSED'}
                                className="btn"
                                style={{
                                    flex: 1,
                                    fontSize: '0.8rem',
                                    padding: '0.5rem',
                                    background: road.status === 'CLOSED' ? '#e2e8f0' : 'var(--color-danger)',
                                    color: road.status === 'CLOSED' ? '#94a3b8' : 'white',
                                    cursor: road.status === 'CLOSED' ? 'default' : 'pointer'
                                }}
                            >
                                <XCircle size={14} /> Kapalı
                            </button>
                            <button
                                onClick={() => updateRoadStatus(road.id, 'WORK')}
                                disabled={road.status === 'WORK'}
                                className="btn"
                                style={{
                                    flex: 1,
                                    fontSize: '0.8rem',
                                    padding: '0.5rem',
                                    background: road.status === 'WORK' ? '#e2e8f0' : 'var(--color-warning)',
                                    color: road.status === 'WORK' ? '#94a3b8' : 'white',
                                    cursor: road.status === 'WORK' ? 'default' : 'pointer'
                                }}
                            >
                                <AlertTriangle size={14} /> Çalışma
                            </button>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <button
                                className="btn"
                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem', background: 'transparent', border: '1px dashed #ccc', color: '#888' }}
                                onClick={() => {
                                    backupToLocalStorage();
                                    alert("Bu yolun verileri tarayıcıya yedeklendi.");
                                }}
                            >
                                Yerel Yedek Al
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Duyuru Yönetimi
                </h2>
                <div style={{ marginTop: '1rem', display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Add Announcement Form */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0 }}>Yeni Duyuru Ekle</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const title = (e.currentTarget.elements.namedItem('title') as HTMLInputElement).value;
                            const content = (e.currentTarget.elements.namedItem('content') as HTMLTextAreaElement).value;
                            if (title && content) {
                                addAnnouncement(title, content);
                                (e.target as HTMLFormElement).reset();
                            }
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Başlık</label>
                                <input name="title" required className="input" placeholder="Örn: Su Kesintisi" style={{ width: '100%' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>İçerik</label>
                                <textarea name="content" required className="input" rows={4} placeholder="Duyuru detayları..." style={{ width: '100%', fontFamily: 'inherit' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Yayınla
                            </button>
                        </form>
                    </div>

                    {/* Announcement List */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0 }}>Aktif Duyurular</h3>
                        {announcements.length === 0 ? (
                            <p style={{ color: '#999' }}>Henüz duyuru yok.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {announcements.map(announcement => (
                                    <div key={announcement.id} style={{
                                        padding: '0.75rem',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong>{announcement.title}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {new Date(announcement.date).toLocaleDateString("tr-TR")}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
                                                    deleteAnnouncement(announcement.id);
                                                }
                                            }}
                                            className="btn btn-danger"
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={24} /> Gelen Bildirimler (Sorun / İstek)
                </h2>
                {reports.length === 0 ? (
                    <p style={{ color: '#999' }}>Henüz bildirim yok.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {reports.map(report => (
                            <div key={report.id} style={{
                                padding: '1rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: '#f8fafc'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {new Date(report.created_at).toLocaleString('tr-TR')}
                                    </span>
                                </div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{report.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <PhotoGallery />
        </div>


    );
};

export default Dashboard;

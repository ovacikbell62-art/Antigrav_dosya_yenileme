import { useAnnouncements } from '../context/AnnouncementContext';
import { AlertCircle, Calendar } from 'lucide-react';

const AnnouncementsPage = () => {
    const { announcements } = useAnnouncements();
    // Show all announcements here, sorted by date DESC
    const sortedAnnouncements = [...announcements].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
                Tüm Duyurular
            </h1>

            {sortedAnnouncements.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p>Henüz yayınlanmış bir duyuru bulunmamaktadır.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {sortedAnnouncements.map(announcement => (
                        <div key={announcement.id} className="card" style={{
                            borderLeft: `5px solid ${announcement.active ? 'var(--color-warning)' : 'var(--color-text-muted)'}`,
                            padding: '1.5rem',
                            position: 'relative',
                            opacity: announcement.active ? 1 : 0.7
                        }}>
                            {!announcement.active && (
                                <span style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: '#eee',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    color: '#666'
                                }}>
                                    Arşiv
                                </span>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <AlertCircle size={24} style={{ color: announcement.active ? 'var(--color-warning)' : '#999' }} />
                                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{announcement.title}</h2>
                            </div>

                            <p style={{ margin: '0.5rem 0 1rem 0', paddingLeft: '2.5rem', lineHeight: 1.6 }}>
                                {announcement.content}
                            </p>

                            <div style={{ paddingLeft: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <Calendar size={16} />
                                <span>{new Date(announcement.date).toLocaleDateString("tr-TR")}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;

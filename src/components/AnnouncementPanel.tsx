import { useAnnouncements } from '../context/AnnouncementContext';
import { AlertCircle } from 'lucide-react';

const AnnouncementPanel = () => {
    const { announcements } = useAnnouncements();
    const activeAnnouncements = announcements.filter(a => a.active);

    if (activeAnnouncements.length === 0) return null;

    return (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {activeAnnouncements.map(announcement => (
                <div key={announcement.id} className="card" style={{
                    borderLeft: '4px solid var(--color-warning)',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}>
                    <AlertCircle style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{announcement.title}</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{announcement.content}</p>
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#999' }}>
                            {new Date(announcement.date).toLocaleDateString("tr-TR")}
                        </small>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnnouncementPanel;

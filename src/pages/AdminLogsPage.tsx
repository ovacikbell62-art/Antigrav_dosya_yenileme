import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface LogEntry {
    id: string;
    user_id: string;
    action: string;
    details: any;
    created_at: string;
}

const AdminLogsPage = () => {
    const { isSuperAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!isSuperAdmin) {
            alert('Bu sayfaya erişim yetkiniz yok!');
            navigate('/dashboard');
            return;
        }

        fetchLogs();
    }, [isAuthenticated, isSuperAdmin, navigate]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Loglar çekilemedi:', error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={20} />
                        Geri
                    </button>
                    <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Sistem Logları (Son 100 İşlem)</h2>
                </div>
                <button
                    onClick={fetchLogs}
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={20} className={loading ? 'spin' : ''} />
                    Yenile
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Yükleniyor...</div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Henüz kayıt bulunmamaktadır.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Tarih</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Kullanıcı</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>İşlem</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Detaylar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem' }}>{formatDate(log.created_at)}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{log.user_id}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                background: log.action === 'LOGIN' ? '#e3f2fd' :
                                                    log.action === 'LOGOUT' ? '#ffebee' : '#f3e5f5',
                                                color: log.action === 'LOGIN' ? '#1565c0' :
                                                    log.action === 'LOGOUT' ? '#c62828' : '#6a1b9a'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#555' }}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogsPage;

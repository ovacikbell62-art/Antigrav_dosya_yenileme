import { useState } from 'react';
import AnnouncementPanel from '../components/AnnouncementPanel';
import { Send } from 'lucide-react';
import { supabase } from '../supabase';

const HomePage = () => {
    const [reportText, setReportText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportText.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('reports')
                .insert([{ message: reportText }]);

            if (error) throw error;

            setSubmitted(true);
            setReportText('');
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error("Report sending error:", error);
            alert("Bildirim gönderilemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Ovacık Belediyesi</h1>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    Resmi Web Platformuna Hoşgeldiniz.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <section>
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Önemli Duyurular</h2>
                    <AnnouncementPanel />
                </section>

                <section className="card">
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>Sorun / İstek Bildir</h2>
                    {submitted ? (
                        <div style={{ padding: '1rem', background: '#ecfdf5', color: '#047857', borderRadius: 'var(--radius-md)' }}>
                            Bildiriminiz başarıyla iletilmiştir. Teşekkür ederiz.
                        </div>
                    ) : (
                        <form onSubmit={handleReport}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="report" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mesajınız</label>
                                <textarea
                                    id="report"
                                    rows={4}
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    placeholder="Yol durumu, arıza veya önerilerinizi buraya yazabilirsiniz..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={!reportText.trim() || loading}>
                                <Send size={16} /> {loading ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default HomePage;

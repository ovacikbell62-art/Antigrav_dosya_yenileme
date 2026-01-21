const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '2rem 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ textAlign: 'center', opacity: 0.8 }}>
                <p>&copy; {new Date().getFullYear()} T.C. Ovacık Belediyesi. Tüm hakları saklıdır. (v2.0.1)</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Fen İşleri Müdürlüğü tarafından geliştirilmiştir.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

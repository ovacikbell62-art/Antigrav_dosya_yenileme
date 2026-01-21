import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import AdminMapCanvas from '../components/map/AdminMapCanvas';

const MapEditorPage = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/login');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    if (!isAuthenticated || !isAdmin) return null;

    return <AdminMapCanvas />;
};

export default MapEditorPage;

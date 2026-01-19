import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import AdminMapCanvas from '../components/map/AdminMapCanvas';

const MapEditorPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    if (!user || user.role !== 'ADMIN') return null;

    return <AdminMapCanvas />;
};

export default MapEditorPage;

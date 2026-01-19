import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Landmark, LandmarkType } from '../types';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

interface LandmarkContextType {
    landmarks: Landmark[];
    addLandmark: (type: LandmarkType, name: string, coordinates: { lat: number; lng: number }) => Promise<void>;
    deleteLandmark: (id: string) => Promise<void>;
}

const LandmarkContext = createContext<LandmarkContextType | undefined>(undefined);

export const LandmarkProvider = ({ children }: { children: ReactNode }) => {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);

    const fetchLandmarks = async () => {
        try {
            const { data, error } = await supabase
                .from('landmarks')
                .select('*');

            if (error) throw error;
            if (data) {
                setLandmarks(data);
            }
        } catch (error) {
            console.error('Error fetching landmarks:', error);
        }
    };

    useEffect(() => {
        fetchLandmarks();
    }, []);

    const addLandmark = async (type: LandmarkType, name: string, coordinates: { lat: number; lng: number }) => {
        try {
            const newLandmark: Landmark = {
                id: uuidv4(),
                type,
                name,
                coordinates
            };

            const { error } = await supabase.from('landmarks').insert([newLandmark]);
            if (error) throw error;

            setLandmarks(prev => [...prev, newLandmark]);
        } catch (error) {
            console.error('Error adding landmark:', error);
            alert('İşaret eklenirken hata oluştu.');
        }
    };

    const deleteLandmark = async (id: string) => {
        setLandmarks(prev => prev.filter(l => l.id !== id));
        try {
            const { error } = await supabase.from('landmarks').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting landmark:', error);
            fetchLandmarks();
        }
    };

    return (
        <LandmarkContext.Provider value={{ landmarks, addLandmark, deleteLandmark }}>
            {children}
        </LandmarkContext.Provider>
    );
};

export const useLandmarks = () => {
    const context = useContext(LandmarkContext);
    if (context === undefined) {
        throw new Error('useLandmarks must be used within a LandmarkProvider');
    }
    return context;
};

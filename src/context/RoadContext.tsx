import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Road, RoadStatus, RoadImage } from '../types';
import { MOCK_ROADS } from '../data/mockRoads';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

interface RoadContextType {
    roads: Road[];
    updateRoadStatus: (id: string, status: RoadStatus) => void;
    updateAllRoadStatus: (status: RoadStatus) => Promise<void>;
    addRoad: (road: Omit<Road, 'id' | 'lastUpdated'>) => void;
    deleteRoad: (id: string) => void;
    updateRoadName: (id: string, name: string) => void;
    addRoadImage: (id: string, imageUrl: string) => void;
    deleteRoadImage: (id: string, imageUrl: string) => void;
    uploadRoadImage: (id: string, file: File) => Promise<void>;
}

const RoadContext = createContext<RoadContextType | undefined>(undefined);

export const RoadProvider = ({ children }: { children: ReactNode }) => {
    const [roads, setRoads] = useState<Road[]>([]);
    const { user } = useAuth();

    // Fetch roads from Supabase
    const fetchRoads = async () => {
        try {
            const { data, error } = await supabase
                .from('roads')
                .select('*')
                .order('name');

            if (error) throw error;

            console.log("Fetched roads:", data?.length);

            if (!data || data.length === 0) {
                // Try to seed if empty.
                if (data && data.length === 0) {
                    await seedInitialData();
                } else {
                    setRoads([]);
                }
            } else {
                const mappedRoads: Road[] = data.map((dbRoad: any) => ({
                    id: dbRoad.id,
                    name: dbRoad.name,
                    status: dbRoad.status as RoadStatus,
                    coordinates: dbRoad.coordinates,
                    images: (dbRoad.images || []).map((img: any) =>
                        typeof img === 'string'
                            ? { url: img, addedBy: 'Bilinmiyor', date: new Date().toISOString() }
                            : img
                    ),
                    lastUpdated: dbRoad.last_updated
                }));
                // Check for duplicate IDs which can cause React key errors
                const uniqueRoads = Array.from(new Map(mappedRoads.map(item => [item.id, item])).values());
                setRoads(uniqueRoads);
            }
        } catch (error) {
            console.error('Error fetching roads:', error);
            // CRITICAL: Do NOT fallback to MOCK_ROADS if online fetch fails.
        }
    };

    const seedInitialData = async () => {
        console.log('Seeding initial data...');
        try {
            // Generate valid UUIDs for mock data instead of using "1", "2" etc.
            const dbPayload = MOCK_ROADS.map(road => ({
                id: uuidv4(), // Explicitly generate UUID
                name: road.name,
                status: 'OPEN',
                coordinates: road.coordinates,
                images: [],
                last_updated: new Date().toISOString()
            }));

            const { data, error } = await supabase
                .from('roads')
                .insert(dbPayload)
                .select();

            if (error) {
                console.error("Seeding insert error:", error);
                throw error;
            }

            if (data) {
                const mapped: Road[] = data.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    status: r.status as RoadStatus,
                    coordinates: r.coordinates,
                    images: (r.images || []).map((img: any) =>
                        typeof img === 'string'
                            ? { url: img, addedBy: 'Bilinmiyor', date: new Date().toISOString() }
                            : img
                    ),
                    lastUpdated: r.last_updated
                }));
                setRoads(mapped);
            }
        } catch (err) {
            console.error("Seeding failed:", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchRoads();
    }, []);

    const updateRoadStatus = async (id: string, status: RoadStatus) => {
        // Optimistic update
        setRoads(prev => prev.map(r => r.id === id ? { ...r, status, lastUpdated: new Date().toISOString() } : r));

        try {
            const { error } = await supabase
                .from('roads')
                .update({ status, last_updated: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Durum güncellenirken hata oluştu!");
            fetchRoads();
        }
    };

    const updateAllRoadStatus = async (status: RoadStatus) => {
        // Optimistic update
        setRoads(prev => prev.map(r => ({ ...r, status, lastUpdated: new Date().toISOString() })));

        try {
            // Get all IDs
            const ids = roads.map(r => r.id);

            // Batch update using 'in' filter
            const { error } = await supabase
                .from('roads')
                .update({ status, last_updated: new Date().toISOString() })
                .in('id', ids);

            if (error) throw error;
        } catch (err) {
            console.error("Error updating all roads:", err);
            fetchRoads(); // Revert
        }
    };

    const addRoad = async (roadData: Omit<Road, 'id' | 'lastUpdated'>) => {
        console.log("Adding road:", roadData);
        try {
            const newId = uuidv4(); // Generate Client-side UUID
            const newRoadPayload = {
                id: newId,
                name: roadData.name,
                status: roadData.status,
                coordinates: roadData.coordinates,
                images: [],
                last_updated: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('roads')
                .insert([newRoadPayload])
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            if (data) {
                console.log("Road added successfully:", data);
                const newRoad: Road = {
                    id: data.id,
                    name: data.name,
                    status: data.status as RoadStatus,
                    coordinates: data.coordinates,
                    images: (data.images || []).map((img: any) =>
                        typeof img === 'string'
                            ? { url: img, addedBy: 'Bilinmiyor', date: new Date().toISOString() }
                            : img
                    ),
                    lastUpdated: data.last_updated
                };
                setRoads(prev => [...prev, newRoad]);
            }
        } catch (err) {
            console.error("Error adding road:", err);
            alert("Yol eklenirken bir hata oluştu! Veritabanı izinlerini kontrol edin.");
            fetchRoads(); // Revert local state
        }
    };

    const deleteRoad = async (id: string) => {
        // Optimistic update
        setRoads(prev => prev.filter(r => r.id !== id));

        try {
            console.log('Deleting road:', id);

            const { error, count } = await supabase
                .from('roads')
                .delete({ count: 'exact' })
                .eq('id', id);

            if (error) {
                console.error("Supabase delete error:", error);
                alert("Yol silinirken bir hata oluştu!");
                throw error;
            }

            if (count === 0) {
                console.warn("Road not found in DB to delete:", id);
            }

        } catch (err) {
            console.error("Error deleting road:", err);
            fetchRoads();
        }
    };

    const updateRoadName = async (id: string, name: string) => {
        setRoads(prev => prev.map(r => r.id === id ? { ...r, name } : r));

        try {
            const { error } = await supabase
                .from('roads')
                .update({ name, last_updated: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Error updating name:", err);
            fetchRoads();
        }
    };

    const addRoadImage = async (id: string, imageUrl: string) => {
        const road = roads.find(r => r.id === id);
        if (!road) return;

        const newImageObj: RoadImage = {
            url: imageUrl,
            addedBy: user?.username || 'Anonim',
            date: new Date().toISOString()
        };

        const newImages = [...(road.images || []), newImageObj];

        // Optimistic
        setRoads(prev => prev.map(r => r.id === id ? { ...r, images: newImages } : r));

        try {
            const { error } = await supabase
                .from('roads')
                .update({ images: newImages, last_updated: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Error adding image:", err);
            fetchRoads();
        }
    };

    const deleteRoadImage = async (id: string, imageUrl: string) => {
        const road = roads.find(r => r.id === id);
        if (!road) return;

        // Filter by URL since imageUrl arg is string
        const newImages = (road.images || []).filter(img => img.url !== imageUrl);

        // Optimistic
        setRoads(prev => prev.map(r => r.id === id ? { ...r, images: newImages } : r));

        try {
            const { error } = await supabase
                .from('roads')
                .update({ images: newImages, last_updated: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Error deleting image:", err);
            fetchRoads();
        }
    };

    const uploadRoadImage = async (id: string, file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}/${uuidv4()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('road_images')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Storage upload error:", uploadError);
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('road_images')
                .getPublicUrl(filePath);

            // 3. Add to Road record
            await addRoadImage(id, publicUrl);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Fotoğraf yüklenirken hata oluştu!");
            throw error;
        }
    };

    return (
        <RoadContext.Provider value={{ roads, updateRoadStatus, updateAllRoadStatus, addRoad, deleteRoad, updateRoadName, addRoadImage, deleteRoadImage, uploadRoadImage }}>
            {children}
        </RoadContext.Provider>
    );
};

export const useRoads = () => {
    const context = useContext(RoadContext);
    if (context === undefined) {
        throw new Error('useRoads must be used within a RoadProvider');
    }
    return context;
};

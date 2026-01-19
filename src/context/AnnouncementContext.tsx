import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Announcement } from '../types';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

interface AnnouncementContextType {
    announcements: Announcement[];
    addAnnouncement: (title: string, content: string) => void;
    deleteAnnouncement: (id: string) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            if (data) {
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    // Initial fetch
    useState(() => {
        fetchAnnouncements();
    });

    const addAnnouncement = async (title: string, content: string) => {
        try {
            const newAnnouncement = {
                id: uuidv4(),
                title,
                content,
                date: new Date().toISOString(),
                active: true
            };

            const { error } = await supabase
                .from('announcements')
                .insert([newAnnouncement]);

            if (error) throw error;

            setAnnouncements(prev => [newAnnouncement, ...prev]);
        } catch (error) {
            console.error('Error adding announcement:', error);
            alert('Duyuru eklenirken bir hata oluştu.');
        }
    };

    const deleteAnnouncement = async (id: string) => {
        // Optimistic update
        setAnnouncements(prev => prev.filter(a => a.id !== id));

        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            fetchAnnouncements(); // Revert if failed
        }
    };

    return (
        <AnnouncementContext.Provider value={{ announcements, addAnnouncement, deleteAnnouncement }}>
            {children}
        </AnnouncementContext.Provider>
    );
};

export const useAnnouncements = () => {
    const context = useContext(AnnouncementContext);
    if (context === undefined) {
        throw new Error('useAnnouncements must be used within an AnnouncementProvider');
    }
    return context;
};

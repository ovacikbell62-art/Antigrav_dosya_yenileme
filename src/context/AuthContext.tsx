import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase } from '../supabase';

type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'CITIZEN';

interface User {
    id: string;
    username: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    logAction: (action: string, details?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // İZİN VERİLEN YÖNETİCİLER
    const ADMIN_USERS = [
        'admin',
        'hüseyin', 'huseyin',
        'şamil', 'samil',
        'sözen', 'sozen',
        'mertcan',
        'onur',
        'düzgün', 'duzgun'
    ];

    // ORTAK ŞİFRE
    const ADMIN_PASSWORD = 'Ovacik123!';

    // SÜPER YÖNETİCİ BİLGİLERİ
    const SUPER_ADMIN_USER = 'admin'; // veya özel bir kullanıcı adı
    const SUPER_ADMIN_PASS = 'Hayabusa1234.';

    const logAction = async (action: string, details: any = {}) => {
        if (!user) return; // Kullanıcı yoksa loglama (Giriş hariç, onu login içinde elle yaparız)

        try {
            await supabase.from('logs').insert({
                user_id: user.id || 'unknown',
                action: action,
                details: details
            });
        } catch (error) {
            console.error('Loglama hatası:', error);
        }
    };

    const login = async (username: string, password?: string) => {
        // Yapay gecikme (network hissi için)
        await new Promise(resolve => setTimeout(resolve, 500));

        const lowerUsername = username.toLowerCase().trim();

        // 1. SÜPER YÖNETİCİ KONTROLÜ
        if (lowerUsername === SUPER_ADMIN_USER.toLowerCase() && password === SUPER_ADMIN_PASS) {
            const newUser: User = {
                id: 'super_admin_01',
                username: 'Süper Yönetici',
                role: 'SUPER_ADMIN'
            };
            setUser(newUser);

            // Logla (Manuel, çünkü state henüz güncellenmedi)
            try {
                await supabase.from('logs').insert({
                    user_id: 'super_admin_01',
                    action: 'LOGIN',
                    details: { role: 'SUPER_ADMIN', method: 'password' }
                });
            } catch (e) { console.error(e); }

            return { success: true };
        }

        // 2. NORMAL YÖNETİCİ KONTROLÜ
        if (ADMIN_USERS.includes(lowerUsername) && password === ADMIN_PASSWORD) {
            const newUser: User = {
                id: lowerUsername,
                username: username,
                role: 'ADMIN'
            };
            setUser(newUser);

            // Logla
            try {
                await supabase.from('logs').insert({
                    user_id: lowerUsername,
                    action: 'LOGIN',
                    details: { role: 'ADMIN', method: 'password' }
                });
            } catch (e) { console.error(e); }

            return { success: true };
        }

        return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' };
    };

    const logout = () => {
        if (user) {
            logAction('LOGOUT');
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            logAction,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
            isSuperAdmin: user?.role === 'SUPER_ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

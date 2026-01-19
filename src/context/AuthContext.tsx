import { createContext, useContext, useState, type ReactNode } from 'react';

type UserRole = 'ADMIN' | 'CITIZEN';

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

    const login = async (username: string, password?: string) => {
        // Yapay gecikme (network hissi için)
        await new Promise(resolve => setTimeout(resolve, 500));

        const lowerUsername = username.toLowerCase().trim();

        // Şifre Kontrolü
        if (ADMIN_USERS.includes(lowerUsername) && password === ADMIN_PASSWORD) {
            setUser({
                id: lowerUsername,
                username: username, // Görünen isim (büyük/küçük harf korunur)
                role: 'ADMIN'
            });
            return { success: true };
        }

        return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' };
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN'
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

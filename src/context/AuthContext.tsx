import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('intucate_user');
        if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string): Promise<boolean> => {
        // Mock login logic
        if (email.endsWith('@intucate.com')) {
            localStorage.setItem('intucate_user', email);
            setUser(email);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('intucate_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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

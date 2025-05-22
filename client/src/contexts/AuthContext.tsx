import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
  updateUser: (user: User) => void;
  login: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  logout: () => {},
  updateUser: () => {},
  login: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // LocalStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthenticated(true);
      } catch (_) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthenticated(false);
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    isAuthenticated: authenticated,
    user,
    logout,
    updateUser,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

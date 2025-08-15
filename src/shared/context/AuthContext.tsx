import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  healthScore: number;
  level: number;
  experience: number;
  badges: string[];
  subscriptionPlanId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false); // Теперь по умолчанию false
  const [error, setError] = useState<string | null>(null);

  // Моковые данные пользователя для демонстрации
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'demo_user',
    healthScore: 75,
    level: 3,
    experience: 450,
    badges: ['early-adopter', 'fitness-champ'],
    subscriptionPlanId: 'free'
  };

  useEffect(() => {
    // При монтировании проверяем токен в sessionStorage
    if (token) {
      // Имитация загрузки профиля
      setIsLoading(true);
      setTimeout(() => {
        // setUser(mockUser);
        setIsLoading(false);
      }, 500);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Имитация API-запроса
      await new Promise(resolve => setTimeout(resolve, 800));

      // В реальном приложении здесь была бы проверка email/password
      if (email && password) {
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        sessionStorage.setItem('token', mockToken);
        setToken(mockToken);
        setUser({...mockUser, email, username: `${email.split('@')[0]}`});
      } else {
        throw new Error('Email and password are required');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Имитация API-запроса
      await new Promise(resolve => setTimeout(resolve, 800));

      // В реальном приложении здесь была бы регистрация
      if (email && password && username) {
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        sessionStorage.setItem('token', mockToken);
        setToken(mockToken);
        setUser({...mockUser, email, username: `${email.split('@')[0]}`});
      } else {
        throw new Error('All fields are required');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

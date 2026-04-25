import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: '1',
  name: 'Raj Admin',
  email: 'rajesh.m.1984@gmail.com',
  role: 'Super Manager',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch {
        setUserState(DEFAULT_USER);
      }
    } else {
      setUserState(DEFAULT_USER);
      localStorage.setItem('currentUser', JSON.stringify(DEFAULT_USER));
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

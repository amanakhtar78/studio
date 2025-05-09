
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User } from '@/types';
import { sampleUser } from '@/lib/mock-data'; // For mock login
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>; // Simulate async login
  logout: () => void;
  // signup: (email: string, pass: string, name: string) => Promise<boolean>; // For future use
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Check for existing session
  const { toast } = useToast();

  // Simulate checking for an existing session on mount
  useEffect(() => {
    // In a real app, you'd check localStorage/sessionStorage or make an API call
    const storedUser = localStorage.getItem('sweetrolls-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('sweetrolls-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    if (email === sampleUser.email && pass === 'test') { // Mock credentials
      setUser(sampleUser);
      localStorage.setItem('sweetrolls-user', JSON.stringify(sampleUser));
      toast({ title: 'Login Successful', description: `Welcome back, ${sampleUser.name}!` });
      setIsLoading(false);
      return true;
    }
    toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    setIsLoading(false);
    return false;
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sweetrolls-user');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [toast]);

  // const signup = useCallback(async (email: string, pass: string, name: string): Promise<boolean> => {
  //   // Mock signup
  //   setIsLoading(true);
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   const newUser: User = { id: `user-${Date.now()}`, email, name, avatarUrl: `https://picsum.photos/seed/${name}/100/100` };
  //   setUser(newUser);
  //   localStorage.setItem('sweetrolls-user', JSON.stringify(newUser));
  //   toast({ title: 'Account Created', description: `Welcome, ${name}!` });
  //   setIsLoading(false);
  //   return true;
  // }, [toast]);


  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    // signup,
  }), [user, isAuthenticated, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
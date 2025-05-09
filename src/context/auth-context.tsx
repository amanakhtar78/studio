
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User, UserAddress, AddressType } from '@/types';
import { sampleUser } from '@/lib/mock-data'; // For mock login
import { useToast } from '@/hooks/use-toast';

// Define the shape of signup data including new fields
interface SignupData {
  name: string;
  email: string;
  password?: string; // Password might not be needed if using OAuth, but good for traditional signup
  phoneNumber?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPinCode?: string;
  addressType?: AddressType;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>; // Updated signup signature
  updateUserProfile: (updatedProfileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('sweetrolls-user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('sweetrolls-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    if (email.toLowerCase() === sampleUser.email.toLowerCase() && pass === 'test') {
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

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    console.log("Mock Signup attempt with data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send this data to your backend to create a new user.
    // Then, the backend would return the new user object or a session token.
    // For this mock, we will simulate a successful signup by logging in the sampleUser
    // IF the email provided is sampleUser's email. This allows testing the UI flow.
    
    if (data.email.toLowerCase() === sampleUser.email.toLowerCase()) {
      // Simulate that signup was successful and the user is now logged in as sampleUser.
      // We could potentially create a new user object here based on `data` and save it.
      // For simplicity, we'll just use sampleUser.
      setUser(sampleUser);
      localStorage.setItem('sweetrolls-user', JSON.stringify(sampleUser));
      toast({ title: 'Account Created!', description: `Welcome, ${data.name}! Please complete your profile if needed.` });
      setIsLoading(false);
      return true;
    } else {
      // Simulate a generic new user creation if email is not sampleUser's
      const newMockUserId = `user-${Date.now()}`;
      const newMockUser: User = {
          id: newMockUserId,
          name: data.name,
          email: data.email,
          avatarUrl: `https://picsum.photos/seed/${newMockUserId}/100/100`,
          phoneNumber: data.phoneNumber,
          address: data.addressStreet && data.addressCity && data.addressPinCode && data.addressType ? {
              street: data.addressStreet,
              city: data.addressCity,
              pinCode: data.addressPinCode,
              addressType: data.addressType,
          } : undefined,
      };
      setUser(newMockUser);
      localStorage.setItem('sweetrolls-user', JSON.stringify(newMockUser));
      toast({ title: 'Account Created!', description: `Welcome, ${newMockUser.name}!` });
      setIsLoading(false);
      return true;
    }
    // toast({ title: 'Signup Failed', description: 'Could not create account (mock error).', variant: 'destructive' });
    // setIsLoading(false);
    // return false;
  }, [toast]);

  const updateUserProfile = useCallback(async (updatedProfileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    setUser(currentUser => {
      if (!currentUser) return null;
      
      const newUser = { ...currentUser };

      // Merge top-level fields
      for (const key in updatedProfileData) {
        if (key !== 'address' && updatedProfileData.hasOwnProperty(key)) {
          (newUser as any)[key] = (updatedProfileData as any)[key];
        }
      }
      
      // Deep merge address
      if (updatedProfileData.address) {
        newUser.address = {
          ...(currentUser.address || {} as UserAddress), // Ensure address object exists
          ...updatedProfileData.address,
        };
      }
      
      localStorage.setItem('sweetrolls-user', JSON.stringify(newUser));
      return newUser;
    });

    toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
    setIsLoading(false);
    return true;
  }, [toast]);

  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    updateUserProfile,
  }), [user, isAuthenticated, isLoading, login, logout, signup, updateUserProfile]);

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

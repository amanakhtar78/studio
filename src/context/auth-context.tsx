
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User, UserAddress, AddressType, SignupData } from '@/types';
import { sampleUser } from '@/lib/mock-data'; // For mock login
import { useToast } from '@/hooks/use-toast';
import { userSignupAPI } from '@/services/api'; 

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
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
    
    const apiPayload = {
      FIRSTNAME: data.firstName,
      LASTNAME: data.lastName,
      EMAILADDRESS: data.email,
      PASSWORD: data.password, 
      COUNTRY: data.country || '', 
      CITY: data.addressCity || '',
      POSTALCODE: data.addressPinCode || '',
      PHYSICALADDRESS: data.addressStreet || '',
      PHONENUMBER: data.phoneNumber || '',
    };

    try {
      const response = await userSignupAPI(apiPayload);

      // Assuming a successful HTTP status means user created.
      // If API returns a specific success message, check response.data.message
      
      const newMockUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newMockUserId, 
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        avatarUrl: `https://placehold.co/100x100.png?text=${data.firstName.charAt(0)}`,
        phoneNumber: data.phoneNumber,
        address: data.addressStreet && data.addressCity && data.addressPinCode && data.addressType && data.country ? {
          street: data.addressStreet,
          city: data.addressCity,
          pinCode: data.addressPinCode,
          country: data.country,
          addressType: data.addressType,
        } : undefined,
      };
      setUser(newUser);
      localStorage.setItem('sweetrolls-user', JSON.stringify(newUser));
      toast({ title: 'Account Created!', description: `Welcome, ${newUser.name}! Your account has been successfully created.` });
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error("Signup API error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Could not create account. Please try again.';
      toast({ title: 'Signup Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const updateUserProfile = useCallback(async (updatedProfileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    setUser(currentUser => {
      if (!currentUser) return null;
      
      const newUser = { ...currentUser };

      for (const key in updatedProfileData) {
        if (key !== 'address' && updatedProfileData.hasOwnProperty(key)) {
          (newUser as any)[key] = (updatedProfileData as any)[key];
        }
      }
      
      if (updatedProfileData.address) {
        newUser.address = {
          ...(currentUser.address || {} as UserAddress), 
          ...updatedProfileData.address,
        };
      }
      
      if(updatedProfileData.firstName || updatedProfileData.lastName) {
        newUser.name = `${updatedProfileData.firstName || currentUser.firstName || ''} ${updatedProfileData.lastName || currentUser.lastName || ''}`.trim();
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

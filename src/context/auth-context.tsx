
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User, UserAddress, AddressType, SignupData, ApiUserDetail } from '@/types';
// import { sampleUser } from '@/lib/mock-data'; // No longer using sampleUser for login
import { useToast } from '@/hooks/use-toast';
import { userSignupAPI, checkUserExistsAPI, fetchAuthenticatedUserAPI } from '@/services/api'; 

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
    setIsLoading(true);
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
    try {
      const response = await fetchAuthenticatedUserAPI(email, pass);
      if (response.data && response.data.length > 0) {
        const apiUser = response.data[0]; // Take the first user if multiple (should ideally be unique by email/pass)
        
        const loggedInUser: User = {
          id: apiUser.EMAILADDRESS, // Using email as ID, ensure this is unique and suitable for your app
          email: apiUser.EMAILADDRESS,
          firstName: apiUser.FIRSTNAME,
          lastName: apiUser.LASTNAME,
          name: `${apiUser.FIRSTNAME || ''} ${apiUser.LASTNAME || ''}`.trim(),
          avatarUrl: `https://placehold.co/100x100.png?text=${(apiUser.FIRSTNAME || 'U').charAt(0)}${(apiUser.LASTNAME || '').charAt(0)}`.toUpperCase(),
          phoneNumber: apiUser.PHONENUMBER,
          address: (apiUser.PHYSICALADDRESS && apiUser.CITY && apiUser.POSTALCODE && apiUser.COUNTRY) ? {
            street: apiUser.PHYSICALADDRESS,
            city: apiUser.CITY,
            pinCode: apiUser.POSTALCODE,
            country: apiUser.COUNTRY,
            addressType: 'home', // Defaulting address type as API doesn't provide it
          } : undefined,
        };

        setUser(loggedInUser);
        localStorage.setItem('sweetrolls-user', JSON.stringify(loggedInUser));
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.name}!` });
        setIsLoading(false);
        return true;
      } else {
        toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Login API error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login.';
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sweetrolls-user');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }, [toast]);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);

    // 1. Check if user already exists
    try {
      const existingUserResponse = await checkUserExistsAPI(data.email);
      if (existingUserResponse.data && existingUserResponse.data.length > 0) {
        toast({ title: 'Signup Failed', description: 'User with this email already exists. Please sign in.', variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Check user exists API error:", error);
      // If checking user existence fails, we might still proceed or show an error
      // For now, let's show an error and stop.
      const checkErrorMessage = error.response?.data?.message || error.message || 'Could not verify email. Please try again.';
      toast({ title: 'Signup Error', description: checkErrorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }

    // 2. If user does not exist, proceed with signup (SP 128)
    const apiPayload = {
      FIRSTNAME: data.firstName,
      LASTNAME: data.lastName,
      EMAILADDRESS: data.email,
      PASSWORD: data.password, // API SP 128 might take this
      COUNTRY: data.country || '', 
      CITY: data.addressCity || '',
      POSTALCODE: data.addressPinCode || '',
      PHYSICALADDRESS: data.addressStreet || '',
      PHONENUMBER: data.phoneNumber || '',
    };

    try {
      const response = await userSignupAPI(apiPayload);
      // Assuming a successful HTTP status and a specific message like "Document Saved" means user created.
      if (response.data && response.data.message && response.data.message.toLowerCase().includes('document saved')) {
        const newUser: User = {
          id: data.email, // Using email as ID for now
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          avatarUrl: `https://placehold.co/100x100.png?text=${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
          phoneNumber: data.phoneNumber,
          address: (data.addressStreet && data.addressCity && data.addressPinCode && data.country && data.addressType) ? {
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
      } else {
        // Handle cases where API call was successful but didn't result in user creation as expected
        const signupErrorMessage = response.data?.message || 'Signup was not successful. Please try again.';
        toast({ title: 'Signup Failed', description: signupErrorMessage, variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Signup API error (SP 128):", error);
      const errorMessage = error.response?.data?.message || error.message || 'Could not create account. Please try again.';
      toast({ title: 'Signup Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const updateUserProfile = useCallback(async (updatedProfileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    // Mock API call for profile update
    await new Promise(resolve => setTimeout(resolve, 500)); 

    setUser(currentUser => {
      if (!currentUser) return null;
      
      const newUser = { ...currentUser };

      // Directly update top-level fields, except 'address'
      for (const key in updatedProfileData) {
        if (key !== 'address' && updatedProfileData.hasOwnProperty(key)) {
          (newUser as any)[key] = (updatedProfileData as any)[key];
        }
      }
      
      // Merge address details if provided
      if (updatedProfileData.address) {
        newUser.address = {
          ...(currentUser.address || {} as UserAddress), // Ensure current address is an object
          ...updatedProfileData.address,
        };
      }
      
      // Reconstruct name if firstName or lastName is updated
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

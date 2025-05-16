
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User, UserAddress, SignupFormData, ApiUserDetail, UserSignupPayload, AuthContextType } from '@/types'; // Updated to SignupFormData
import { useToast } from '@/hooks/use-toast';
import { userSignupAPI, checkUserExistsAPI, fetchAuthenticatedUserAPI } from '@/services/api'; 

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

  const mapApiUserToUser = (apiUser: ApiUserDetail): User => {
    const firstName = apiUser.FIRSTNAME || '';
    const lastName = apiUser.LASTNAME || '';
    return {
      id: apiUser.EMAILADDRESS, 
      email: apiUser.EMAILADDRESS,
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`.trim(),
      avatarUrl: `https://placehold.co/100x100.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
      phoneNumber: apiUser.PHONENUMBER,
      address: (apiUser.PHYSICALADDRESS && apiUser.CITY && apiUser.POSTALCODE) ? {
        street: apiUser.PHYSICALADDRESS,
        city: apiUser.CITY,
        pinCode: apiUser.POSTALCODE,
        country: apiUser.COUNTRY || '', 
        addressType: (apiUser.PHYSICALADDRESS?.toLowerCase().includes('office') ? 'office' : 'home') as AddressType,
      } : undefined,
    };
  };

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetchAuthenticatedUserAPI(email, pass);
      if (response.data && response.data.length > 0) {
        const apiUser = response.data[0];
        const loggedInUser = mapApiUserToUser(apiUser);
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

  const signup = useCallback(async (data: SignupFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const existingUserResponse = await checkUserExistsAPI(data.email);
      if (existingUserResponse.data && existingUserResponse.data.length > 0) {
        toast({ title: 'Signup Failed', description: 'User with this email already exists. Please sign in.', variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      const checkErrorMessage = error.response?.data?.message || error.message || 'Could not verify email. Please try again.';
      toast({ title: 'Signup Error', description: checkErrorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }

    const apiPayload: UserSignupPayload = {
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
      if (response.data && response.data.message && response.data.message.toLowerCase().includes('document saved')) {
        const newUser: User = {
          id: data.email,
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

  const updateUserProfile = useCallback(async (updatedProfileData: Partial<User>, currentPasswordForApi: string): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      return false;
    }
    setIsLoading(true);

    const currentUser = user; 

    const payload: UserSignupPayload = {
      FIRSTNAME: updatedProfileData.firstName || currentUser.firstName || '',
      LASTNAME: updatedProfileData.lastName || currentUser.lastName || '',
      EMAILADDRESS: currentUser.email, 
      PASSWORD: currentPasswordForApi, // Use the provided, validated password
      PHONENUMBER: updatedProfileData.phoneNumber !== undefined ? updatedProfileData.phoneNumber : (currentUser.phoneNumber || ''),
      PHYSICALADDRESS: updatedProfileData.address?.street !== undefined ? updatedProfileData.address.street : (currentUser.address?.street || ''),
      CITY: updatedProfileData.address?.city !== undefined ? updatedProfileData.address.city : (currentUser.address?.city || ''),
      POSTALCODE: updatedProfileData.address?.pinCode !== undefined ? updatedProfileData.address.pinCode : (currentUser.address?.pinCode || ''),
      COUNTRY: updatedProfileData.address?.country !== undefined ? updatedProfileData.address.country : (currentUser.address?.country || ''),
    };
    
    try {
      const response = await userSignupAPI(payload); 
      if (response.data && response.data.message && response.data.message.toLowerCase().includes('document saved')) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const newUser = { 
            ...prevUser, 
            ...updatedProfileData,
            firstName: payload.FIRSTNAME, // Ensure first name is updated
            lastName: payload.LASTNAME,   // Ensure last name is updated
            name: `${payload.FIRSTNAME} ${payload.LASTNAME}`.trim(), // Ensure full name is updated
            address: payload.PHYSICALADDRESS || payload.CITY || payload.POSTALCODE || payload.COUNTRY ? {
              street: payload.PHYSICALADDRESS || '',
              city: payload.CITY || '',
              pinCode: payload.POSTALCODE || '',
              country: payload.COUNTRY || '',
              addressType: updatedProfileData.address?.addressType || prevUser.address?.addressType || 'home',
            } : undefined,
           };
          localStorage.setItem('sweetrolls-user', JSON.stringify(newUser));
          return newUser;
        });
        setIsLoading(false);
        return true;
      } else {
        const updateErrorMessage = response.data?.message || 'Profile update was not successful. Please try again.';
        toast({ title: 'Update Failed', description: updateErrorMessage, variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Update profile API error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Could not update profile. Please try again.';
      toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [user, toast]);


  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to change your password.', variant: 'destructive' });
      return false;
    }
    setIsLoading(true);

    try {
      const verifyResponse = await fetchAuthenticatedUserAPI(user.email, currentPassword);
      if (!verifyResponse.data || verifyResponse.data.length === 0) {
        toast({ title: 'Password Change Failed', description: 'Incorrect current password.', variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any)
     {
      console.error("Verify current password API error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Could not verify current password.';
      toast({ title: 'Password Change Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }

    const payload: UserSignupPayload = {
      FIRSTNAME: user.firstName || '',
      LASTNAME: user.lastName || '',
      EMAILADDRESS: user.email,
      PASSWORD: newPassword, 
      COUNTRY: user.address?.country || '',
      CITY: user.address?.city || '',
      POSTALCODE: user.address?.pinCode || '',
      PHYSICALADDRESS: user.address?.street || '',
      PHONENUMBER: user.phoneNumber || '',
    };

    try {
      const updateResponse = await userSignupAPI(payload); 
      if (updateResponse.data && updateResponse.data.message && updateResponse.data.message.toLowerCase().includes('document saved')) {
        toast({ title: 'Password Updated', description: 'Your password has been successfully changed.' });
        // No need to update user state here, as password changes don't alter displayed user info
        // other than potentially invalidating a stored token if your backend does that.
        setIsLoading(false);
        return true;
      } else {
        const updateErrorMessage = updateResponse.data?.message || 'Password update was not successful. Please try again.';
        toast({ title: 'Password Change Failed', description: updateErrorMessage, variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Change password API error (SP 128):", error);
      const errorMessage = error.response?.data?.message || error.message || 'Could not change password.';
      toast({ title: 'Password Change Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [user, toast]);


  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    updateUserProfile,
    changePassword,
  }), [user, isAuthenticated, isLoading, login, logout, signup, updateUserProfile, changePassword]);

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

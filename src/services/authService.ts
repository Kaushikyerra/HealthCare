import { 
  registerUser as registerUserAPI, 
  loginUser as loginUserAPI, 
  getCurrentUser as getCurrentUserAPI,
  logoutUser as logoutUserAPI
} from './apiService';
import { User } from '../types';

export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'doctor' | 'caretaker' | 'medical-assistant';
  specialization?: string;
  experience?: string;
  languages?: string[];
  bio?: string;
  gender?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  // Available slots for doctors
  availableSlots?: { day: string; slots: string[] }[];
  // Medical Assistant specific fields
  medicalId?: string;
  internshipCertificate?: string;
  digiLockerVerified?: boolean;
}) => {
  try {
    // Convert languages array to string for API
    const apiUserData = {
      ...userData,
      languages: userData.languages ? userData.languages.join(', ') : ''
    };
    
    const user = await registerUserAPI(apiUserData);
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await loginUserAPI(email, password);
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    logoutUserAPI();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await getCurrentUserAPI();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// JWT token utilities
export const generateToken = (user: User): string => {
  // This is now handled by the backend
  throw new Error('Token generation is handled by the backend');
};

export const verifyToken = (token: string): any => {
  // This is now handled by the backend
  throw new Error('Token verification is handled by the backend');
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    // This will be implemented in the backend API
    throw new Error('Update user profile not yet implemented in backend');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
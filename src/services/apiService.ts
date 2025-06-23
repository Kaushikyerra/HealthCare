const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}, requireAuth: boolean = true) => {
  const token = localStorage.getItem('authToken');
  
  // Check if authentication is required but no token is present
  if (requireAuth && !token) {
    throw new Error('Access token required');
  }
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Request Error:', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
      config
    });

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check your network connection or server status.');
    }

    throw error;
  }
};

// Test MongoDB connection
export const testMongoDBConnection = async () => {
  return apiRequest('/test', {}, false); // Don't require auth for test endpoint
};

// Authentication
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'caretaker' | 'medical-assistant';
  specialization?: string;
  experience?: string;
  languages?: string;
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
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, false); // Don't require auth for registration
};

export const loginUser = async (email: string, password: string) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false); // Don't require auth for login
  
  // Store token in localStorage
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response.user;
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me');
};

export const logoutUser = () => {
  localStorage.removeItem('authToken');
};

// Users
export const getAllUsers = async () => {
  return apiRequest('/users');
};

// Appointments
export const createAppointment = async (appointmentData: any) => {
  return apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

export const getAppointments = async () => {
  return apiRequest('/appointments');
};

export const updateAppointment = async (id: string, updates: any) => {
  return apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

// Caretaker Requests
export const createCaretakerRequest = async (requestData: any) => {
  return apiRequest('/caretaker-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

export const getCaretakerRequests = async () => {
  return apiRequest('/caretaker-requests');
};

export const updateCaretakerRequest = async (id: string, status: 'accepted' | 'rejected') => {
  return apiRequest(`/caretaker-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Prescriptions
export const addPrescription = async (appointmentId: string, prescriptionData: any) => {
  return apiRequest(`/appointments/${appointmentId}/prescriptions`, {
    method: 'POST',
    body: JSON.stringify(prescriptionData),
  });
};

// Medication Intakes
export const recordMedicationIntake = async (intakeData: any) => {
  return apiRequest('/medication-intakes', {
    method: 'POST',
    body: JSON.stringify(intakeData),
  });
};

export const getMedicationIntakes = async (prescriptionId: string) => {
  return apiRequest(`/medication-intakes?prescriptionId=${prescriptionId}`);
};

// Medical Visit Requests
export const createMedicalVisitRequest = async (requestData: any) => {
  return apiRequest('/medical-visit-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

export const getMedicalVisitRequests = async () => {
  return apiRequest('/medical-visit-requests');
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}; 
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'caretaker' | 'medical-assistant';
  specialization?: string;
  experience?: string;
  languages?: string[];
  bio?: string;
  gender?: string;
  verified: boolean;
  rating?: number;
  available?: boolean;
  profileImage?: string;
  // Location information for Google Maps
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // Available appointment slots for doctors
  availableSlots?: {
    day: string; // 'monday', 'tuesday', etc.
    slots: string[]; // ['09:00', '10:00', '14:00', '15:00']
  }[];
  // Caretaker specific fields
  transportationType?: 'Personal Car' | 'Ambulance' | 'Public Transport' | 'Wheelchair Accessible Vehicle';
  availableDays?: string[];
  // Medical Assistant specific fields
  medicalId?: string;
  internshipCertificate?: string;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  times: string[];
  duration: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  doctorId?: string;
  doctorName?: string;
  caretakerId?: string;
  caretakerName?: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  location: string;
  type: 'doctor' | 'caretaker';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  prescriptions?: Prescription[];
  notes?: string;
}

export interface MedicationIntake {
  prescriptionId: string;
  medicine: string;
  time: string;
  date: string;
  taken: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface CaretakerRequest {
  id: string;
  patientId: string;
  patientName: string;
  caretakerId: string;
  caretakerName: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: string;
  startDate?: string;
  duration?: string;
  careType?: string;
  message?: string;
}

export interface MedicalVisitRequest {
  id: string;
  patientId: string;
  patientName: string;
  medicalAssistantId?: string;
  medicalAssistantName?: string;
  requestDate: string;
  visitDate: string;
  visitTime: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  serviceType: 'vitals-check' | 'post-surgery-care' | 'medication-monitoring' | 'hospital-escort' | 'patient-education';
  patientAddress: string;
  patientLatitude?: number;
  patientLongitude?: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'request' | 'system' | 'urgent';
  role: 'patient' | 'doctor' | 'caretaker' | 'medical-assistant';
  relatedId?: string; // ID of related appointment, prescription, etc.
  timestamp: Date;
  read: boolean;
  icon?: string; // Optional icon identifier
  severity?: 'low' | 'medium' | 'high';
}
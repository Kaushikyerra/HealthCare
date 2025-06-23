import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Appointment, Prescription, MedicationIntake, CaretakerRequest, MedicalVisitRequest, Notification } from '../types';
import { 
  getAllUsers,
  createAppointment,
  updateAppointment,
  addPrescription,
  getAppointments,
  createCaretakerRequest,
  updateCaretakerRequest,
  getCaretakerRequests,
  recordMedicationIntake,
  getMedicationIntakes,
  createMedicalVisitRequest,
  getMedicalVisitRequests
} from '../services/apiService';

interface AppState {
  // Users
  users: User[];
  currentUser: User | null;
  
  // Appointments
  appointments: Appointment[];
  
  // Medication tracking
  medicationIntakes: MedicationIntake[];
  
  // Caretaker requests
  caretakerRequests: CaretakerRequest[];
  
  // Medical visit requests
  medicalVisitRequests: MedicalVisitRequest[];
  
  // Theme
  darkMode: boolean;
  
  // Loading states
  loading: {
    users: boolean;
    appointments: boolean;
    caretakerRequests: boolean;
  };
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  
  bookAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
  addPrescription: (appointmentId: string, prescription: Omit<Prescription, 'id'>) => Promise<void>;
  
  recordMedicationIntake: (intake: MedicationIntake) => Promise<void>;
  
  requestCaretaker: (request: Omit<CaretakerRequest, 'id'>) => Promise<void>;
  updateCaretakerRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  
  toggleDarkMode: () => void;
  
  // Fetch data from API
  fetchUsers: () => Promise<void>;
  fetchAllAppointments: () => Promise<void>;
  fetchUserAppointments: () => Promise<void>;
  fetchCaretakerRequests: () => Promise<void>;
  fetchMedicalVisitRequests: () => Promise<void>;
  
  // Initialize sample data
  initializeSampleData: () => void;
  
  // Refresh all data
  refreshAllData: () => Promise<void>;
  
  // New actions
  submitMedicalVisitRequest: (request: Omit<MedicalVisitRequest, 'id'>) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  
  // New methods for notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: (role?: 'patient' | 'doctor' | 'caretaker' | 'medical-assistant') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      appointments: [],
      medicationIntakes: [],
      caretakerRequests: [],
      medicalVisitRequests: [],
      darkMode: false,
      loading: {
        users: false,
        appointments: false,
        caretakerRequests: false,
      },
      notifications: [],

      setCurrentUser: (user) => {
        set({ currentUser: user });
        // Don't automatically fetch data here - let App.tsx handle it after authentication
      },

      updateUser: async (userId, updates) => {
        try {
          // Import the updateUser function from apiService
          const apiService = await import('../services/apiService');
          
          const updatedUser = await apiService.updateUser(userId, updates);
          
          // Update the current user in the store if the updated user is the current user
          set((state) => {
            if (state.currentUser?.id === userId) {
              // Only update the fields that actually changed
              return { currentUser: { ...state.currentUser, ...updates } };
            }
            return {};
          });

          // Update the users array
          set((state) => ({
            users: state.users.map(user => 
              user.id === userId ? { ...user, ...updatedUser } : user
            )
          }));

          return updatedUser;
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },

      bookAppointment: async (appointmentData) => {
        try {
          const newAppointment = await createAppointment(appointmentData);
          set((state) => ({
            appointments: [newAppointment, ...state.appointments]
          }));
        } catch (error) {
          console.error('Error booking appointment:', error);
        }
      },

      updateAppointment: async (appointmentId, updates) => {
        try {
          const updatedAppointment = await updateAppointment(appointmentId, updates);
          
          if (updatedAppointment) {
            set((state) => ({
              appointments: state.appointments.map(appointment => 
                appointment.id === appointmentId ? updatedAppointment : appointment
              )
            }));
          }
        } catch (error) {
          console.error('Error updating appointment:', error);
        }
      },

      addPrescription: async (appointmentId, prescription) => {
        try {
          const newPrescription = await addPrescription(appointmentId, prescription);
          
          set((state) => ({
            appointments: state.appointments.map(appointment => 
              appointment.id === appointmentId 
                ? { 
                    ...appointment, 
                    prescriptions: [...(appointment.prescriptions || []), newPrescription] 
                  }
                : appointment
            )
          }));
        } catch (error) {
          console.error('Error adding prescription:', error);
        }
      },

      recordMedicationIntake: async (intake) => {
        try {
          await recordMedicationIntake(intake);
          
          set((state) => {
            const existingIndex = state.medicationIntakes.findIndex(mi => 
              mi.prescriptionId === intake.prescriptionId && 
              mi.date === intake.date && 
              mi.time === intake.time
            );

            if (existingIndex >= 0) {
              const updatedIntakes = [...state.medicationIntakes];
              updatedIntakes[existingIndex] = intake;
              return { medicationIntakes: updatedIntakes };
            } else {
              return { medicationIntakes: [...state.medicationIntakes, intake] };
            }
          });
        } catch (error) {
          console.error('Error recording medication intake:', error);
        }
      },

      requestCaretaker: async (requestData) => {
        try {
          const newRequest = await createCaretakerRequest(requestData);
          set((state) => ({
            caretakerRequests: [newRequest, ...state.caretakerRequests]
          }));
        } catch (error) {
          console.error('Error requesting caretaker:', error);
        }
      },

      updateCaretakerRequest: async (requestId, status) => {
        try {
          const updatedRequest = await updateCaretakerRequest(requestId, status);
          
          if (updatedRequest) {
            set((state) => ({
              caretakerRequests: state.caretakerRequests.map(request => 
                request.id === requestId ? updatedRequest : request
              )
            }));
          }
        } catch (error) {
          console.error('Error updating caretaker request:', error);
        }
      },

      fetchUsers: async () => {
        try {
          set((state) => ({ loading: { ...state.loading, users: true } }));
          const users = await getAllUsers();
          set({ users, loading: { ...get().loading, users: false } });
        } catch (error) {
          console.error('Error fetching users:', error);
          set((state) => ({ loading: { ...state.loading, users: false } }));
        }
      },

      fetchAllAppointments: async () => {
        try {
          set((state) => ({ loading: { ...state.loading, appointments: true } }));
          const appointments = await getAppointments();
          set({ appointments, loading: { ...get().loading, appointments: false } });
        } catch (error) {
          console.error('Error fetching appointments:', error);
          set((state) => ({ loading: { ...state.loading, appointments: false } }));
        }
      },

      fetchUserAppointments: async () => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          set((state) => ({ loading: { ...state.loading, appointments: true } }));
          const appointments = await getAppointments();
          set({ appointments, loading: { ...get().loading, appointments: false } });
        } catch (error) {
          console.error('Error fetching user appointments:', error);
          set((state) => ({ loading: { ...state.loading, appointments: false } }));
        }
      },

      fetchCaretakerRequests: async () => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          set((state) => ({ loading: { ...state.loading, caretakerRequests: true } }));
          const requests = await getCaretakerRequests();
          set({ caretakerRequests: requests, loading: { ...get().loading, caretakerRequests: false } });
        } catch (error) {
          console.error('Error fetching caretaker requests:', error);
          set((state) => ({ loading: { ...state.loading, caretakerRequests: false } }));
        }
      },

      fetchMedicalVisitRequests: async () => {
        try {
          const requests = await getMedicalVisitRequests();
          set({ medicalVisitRequests: requests });
        } catch (error) {
          console.error('Error fetching medical visit requests:', error);
        }
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      initializeSampleData: () => {
        // Don't fetch data here since it requires authentication
        // Data will be fetched after successful authentication in App.tsx
        console.log('Sample data initialization skipped - will be handled after authentication');
      },

      refreshAllData: async () => {
        try {
          await Promise.all([
            get().fetchUsers(),
            get().fetchAllAppointments(),
            get().fetchCaretakerRequests(),
            get().fetchMedicalVisitRequests()
          ]);
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      },

      submitMedicalVisitRequest: async (request) => {
        try {
          const newRequest = await createMedicalVisitRequest(request);
          set((state) => ({
            medicalVisitRequests: [newRequest, ...state.medicalVisitRequests]
          }));
        } catch (error) {
          console.error('Error submitting medical visit request:', error);
        }
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [...state.notifications, notification]
        }));
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        }));
      },

      clearNotifications: (role) => {
        set((state) => ({
          notifications: state.notifications.filter(notification =>
            !role || notification.role === role
          )
        }));
      },
    }),
    {
      name: 'heal-together-storage',
    }
  )
); 
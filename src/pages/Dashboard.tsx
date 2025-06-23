import React from 'react';
import { useStore } from '../store/useStore';
import { 
  PatientDashboard, 
  DoctorDashboard, 
  CaretakerDashboard,
  MedicalAssistantDashboard
} from '../components/Dashboard';

export const Dashboard: React.FC = () => {
  const { currentUser } = useStore();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access your dashboard
          </h1>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (currentUser.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'caretaker':
      return <CaretakerDashboard />;
    case 'medical-assistant':
      return <MedicalAssistantDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unknown user role
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please contact support to resolve this issue.
            </p>
          </div>
        </div>
      );
  }
};
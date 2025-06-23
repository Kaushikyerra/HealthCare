import React from 'react';
import { Appointment } from '../../types';
import { Calendar, Clock, MapPin, User, Pill, FileText } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (appointmentId: string, status: Appointment['status']) => void;
  onAddPrescription?: (appointmentId: string) => void;
  showActions?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus,
  onAddPrescription,
  showActions = false
}) => {
  const { darkMode } = useStore();

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            appointment.type === 'doctor' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            <User size={20} className={
              appointment.type === 'doctor' ? 'text-blue-600' : 'text-green-600'
            } />
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.type === 'doctor' 
                ? appointment.doctorName || 'Doctor Appointment'
                : appointment.caretakerName || 'Caretaker Appointment'
              }
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              with {appointment.patientName}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className={`flex items-center space-x-2 text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Calendar size={16} />
          <span>{appointment.date}</span>
        </div>
        
        <div className={`flex items-center space-x-2 text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Clock size={16} />
          <span>{appointment.time}</span>
        </div>
        
        <div className={`flex items-center space-x-2 text-sm col-span-1 sm:col-span-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <MapPin size={16} />
          <span>{appointment.location}</span>
        </div>
      </div>

      {/* Prescriptions */}
      {appointment.prescriptions && appointment.prescriptions.length > 0 && (
        <div className="mb-4">
          <div className={`flex items-center space-x-2 mb-2 text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Pill size={16} />
            <span>Prescriptions ({appointment.prescriptions.length})</span>
          </div>
          <div className="space-y-2">
            {appointment.prescriptions.slice(0, 2).map((prescription) => (
              <div key={prescription.id} className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {prescription.medicine}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {prescription.dosage} - {prescription.times.join(', ')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prescription.duration}
                  </span>
                </div>
              </div>
            ))}
            
            {appointment.prescriptions.length > 2 && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                +{appointment.prescriptions.length - 2} more prescriptions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div className="mb-4">
          <div className={`flex items-center space-x-2 mb-2 text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <FileText size={16} />
            <span>Notes</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} p-3 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            {appointment.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {appointment.status === 'upcoming' && onUpdateStatus && (
            <>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'ongoing')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          
          {appointment.status === 'ongoing' && onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'completed')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Complete
            </button>
          )}
          
          {appointment.type === 'doctor' && onAddPrescription && (
            <button
              onClick={() => onAddPrescription(appointment.id)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Add Prescription
            </button>
          )}
        </div>
      )}
    </div>
  );
};
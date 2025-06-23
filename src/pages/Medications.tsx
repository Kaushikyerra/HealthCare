import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const Medications: React.FC = () => {
  const { currentUser, appointments, medicationIntakes, recordMedicationIntake, darkMode } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  if (!currentUser) return null;

  // Get all prescriptions from user's appointments
  const userPrescriptions = appointments
    .filter(apt => apt.patientId === currentUser.id && apt.prescriptions)
    .flatMap(apt => 
      apt.prescriptions?.map(prescription => ({
        ...prescription,
        appointmentId: apt.id,
        doctorName: apt.doctorName,
        appointmentDate: apt.date
      })) || []
    );

  // Generate medication schedule for selected date
  const getMedicationSchedule = () => {
    const schedule: Array<{
      prescriptionId: string;
      medicine: string;
      dosage: string;
      time: string;
      taken: boolean;
      appointmentId: string;
      doctorName?: string;
    }> = [];

    userPrescriptions.forEach(prescription => {
      prescription.times.forEach(time => {
        const intakeKey = `${prescription.id}-${selectedDate}-${time}`;
        const intake = medicationIntakes.find(mi => 
          mi.prescriptionId === prescription.id && 
          mi.date === selectedDate && 
          mi.time === time
        );

        schedule.push({
          prescriptionId: prescription.id,
          medicine: prescription.medicine,
          dosage: prescription.dosage,
          time,
          taken: intake?.taken || false,
          appointmentId: prescription.appointmentId,
          doctorName: prescription.doctorName
        });
      });
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleToggleIntake = (prescriptionId: string, medicine: string, time: string) => {
    const existingIntake = medicationIntakes.find(mi => 
      mi.prescriptionId === prescriptionId && 
      mi.date === selectedDate && 
      mi.time === time
    );

    recordMedicationIntake({
      prescriptionId,
      medicine,
      time,
      date: selectedDate,
      taken: !existingIntake?.taken
    });
  };

  const schedule = getMedicationSchedule();
  const takenCount = schedule.filter(item => item.taken).length;
  const totalCount = schedule.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Medications
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your medication intake and manage prescriptions
        </p>
      </div>

      {/* Date Selector and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Calendar className="inline h-4 w-4 mr-1" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Medications Taken
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {takenCount} / {totalCount}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completion Rate
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Medication Schedule */}
      {schedule.length > 0 ? (
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Today's Schedule
          </h2>
          
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div
                key={`${item.prescriptionId}-${item.time}`}
                className={`p-4 rounded-lg border transition-all ${
                  item.taken
                    ? darkMode
                      ? 'bg-green-900 border-green-700'
                      : 'bg-green-50 border-green-200'
                    : darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      item.taken ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {item.taken ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Pill className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.medicine}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.dosage} • Prescribed by {item.doctorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`flex items-center text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Clock size={14} className="mr-1" />
                        {item.time}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.taken
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.taken ? 'Taken' : 'Pending'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleIntake(item.prescriptionId, item.medicine, item.time)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        item.taken
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {item.taken ? 'Mark as Missed' : 'Mark as Taken'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Pill size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No medications scheduled
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {userPrescriptions.length === 0 
              ? 'You have no active prescriptions. Visit a doctor to get prescriptions.'
              : 'No medications scheduled for the selected date.'
            }
          </p>
        </div>
      )}

      {/* Active Prescriptions */}
      {userPrescriptions.length > 0 && (
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Active Prescriptions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {prescription.medicine}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {prescription.dosage}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prescription.duration}
                  </span>
                </div>
                
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  <strong>Times:</strong> {prescription.times.join(', ')}
                </div>
                
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Prescribed by:</strong> {prescription.doctorName}
                </div>
                
                {prescription.notes && (
                  <div className={`text-sm mt-2 p-2 rounded ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <strong>Notes:</strong> {prescription.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
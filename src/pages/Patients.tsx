import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserCard } from '../components/Common/UserCard';
import { AppointmentCard } from '../components/Common/AppointmentCard';
import { Users, Search, Calendar, FileText } from 'lucide-react';

export const Patients: React.FC = () => {
  const { currentUser, appointments, users, darkMode } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  if (!currentUser) return null;

  // Get appointments where current user is the doctor or caretaker
  const userAppointments = appointments.filter(apt => 
    apt.doctorId === currentUser.id || apt.caretakerId === currentUser.id
  );

  // Get unique patients from appointments
  const patientIds = [...new Set(userAppointments.map(apt => apt.patientId))];
  const patients = users.filter(user => patientIds.includes(user.id));

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientAppointments = (patientId: string) => {
    return userAppointments.filter(apt => apt.patientId === patientId);
  };

  const getPatientStats = (patientId: string) => {
    const patientAppointments = getPatientAppointments(patientId);
    return {
      total: patientAppointments.length,
      completed: patientAppointments.filter(apt => apt.status === 'completed').length,
      upcoming: patientAppointments.filter(apt => apt.status === 'upcoming').length,
      prescriptions: patientAppointments.reduce((total, apt) => 
        total + (apt.prescriptions?.length || 0), 0
      )
    };
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatient(selectedPatient === patientId ? null : patientId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentUser.role === 'doctor' ? 'My Patients' : 'Patients Under Care'}
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and track your patients' healthcare journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Patients
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {patients.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Appointments
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userAppointments.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userAppointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Upcoming
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userAppointments.filter(apt => apt.status === 'upcoming').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <Search className={`absolute left-3 top-3 h-5 w-5 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length > 0 ? (
        <div className="space-y-6">
          {filteredPatients.map((patient) => {
            const stats = getPatientStats(patient.id);
            const patientAppointments = getPatientAppointments(patient.id);
            const isExpanded = selectedPatient === patient.id;

            return (
              <div key={patient.id} className={`rounded-xl border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={patient.profileImage || 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={patient.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {patient.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {patient.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewPatient(patient.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Patient Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Appointments
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.total}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completed
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.completed}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upcoming
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.upcoming}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Prescriptions
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.prescriptions}
                      </p>
                    </div>
                  </div>

                  {/* Patient Appointments */}
                  {isExpanded && (
                    <div className="border-t pt-6 mt-6">
                      <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Appointment History
                      </h4>
                      
                      {patientAppointments.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {patientAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              showActions={false}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          No appointments found for this patient.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Users size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No patients found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {patients.length === 0 
              ? 'You have no patients yet. Patients will appear here after they book appointments with you.'
              : 'Try adjusting your search terms to find specific patients.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
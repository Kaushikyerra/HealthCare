import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Pill, Search, Calendar, User, Clock, FileText } from 'lucide-react';

export const Prescriptions: React.FC = () => {
  const { currentUser, appointments, darkMode } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  if (!currentUser) return null;

  // Get all prescriptions from appointments where current user is the doctor
  const doctorAppointments = appointments.filter(apt => apt.doctorId === currentUser.id);
  const allPrescriptions = doctorAppointments.flatMap(apt => 
    apt.prescriptions?.map(prescription => ({
      ...prescription,
      appointmentId: apt.id,
      patientName: apt.patientName,
      appointmentDate: apt.date,
      appointmentTime: apt.time,
      status: apt.status
    })) || []
  );

  const filteredPrescriptions = allPrescriptions.filter(prescription => {
    const matchesSearch = prescription.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || prescription.appointmentDate === filterDate;
    return matchesSearch && matchesDate;
  });

  const totalPrescriptions = allPrescriptions.length;
  const activePrescriptions = allPrescriptions.filter(p => p.status !== 'cancelled').length;
  const uniquePatients = new Set(allPrescriptions.map(p => p.patientName)).size;
  const uniqueMedicines = new Set(allPrescriptions.map(p => p.medicine)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Prescriptions
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and track all prescriptions you've issued
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
                Total Prescriptions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalPrescriptions}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Prescriptions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activePrescriptions}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Patients Treated
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {uniquePatients}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Unique Medicines
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {uniqueMedicines}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Pill className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search prescriptions or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="relative">
            <Calendar className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
            }}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length > 0 ? (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={`${prescription.appointmentId}-${prescription.id}`}
              className={`p-6 rounded-xl border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Pill className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {prescription.medicine}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Prescribed to {prescription.patientName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    <Calendar size={14} className="mr-1" />
                    {prescription.appointmentDate}
                  </div>
                  <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock size={14} className="mr-1" />
                    {prescription.appointmentTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Dosage
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {prescription.dosage}
                  </p>
                </div>

                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Times
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {prescription.times.join(', ')}
                  </p>
                </div>

                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Duration
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {prescription.duration}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prescription.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : prescription.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                </div>
              </div>

              {prescription.notes && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Notes
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {prescription.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
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
            No prescriptions found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {totalPrescriptions === 0 
              ? 'You haven\'t issued any prescriptions yet. Prescriptions will appear here after you add them to appointments.'
              : 'Try adjusting your search or filter criteria to find specific prescriptions.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
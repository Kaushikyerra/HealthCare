import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AppointmentCard } from '../components/Common/AppointmentCard';
import { Appointment, Prescription } from '../types';
import { Calendar, Filter, Search, X, Plus, Pill } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Appointments: React.FC = () => {
  const { currentUser, appointments, updateAppointment, addPrescription, darkMode } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicine: '',
    dosage: '',
    times: [''],
    duration: '',
    notes: ''
  });

  if (!currentUser) return null;

  const userAppointments = appointments.filter(apt => 
    apt.patientId === currentUser.id || 
    apt.doctorId === currentUser.id || 
    apt.caretakerId === currentUser.id
  );

  const filteredAppointments = userAppointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.caretakerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (appointmentId: string, status: Appointment['status']) => {
    updateAppointment(appointmentId, { status });
  };

  const handleAddPrescription = (appointmentId: string) => {
    setSelectedAppointment(appointments.find(apt => apt.id === appointmentId) || null);
  };

  const handleSubmitPrescription = () => {
    if (!selectedAppointment) return;

    const prescription: Omit<Prescription, 'id'> = {
      medicine: prescriptionData.medicine,
      dosage: prescriptionData.dosage,
      times: prescriptionData.times.filter(time => time.trim() !== ''),
      duration: prescriptionData.duration,
      notes: prescriptionData.notes
    };

    addPrescription(selectedAppointment.id, prescription);
    setSelectedAppointment(null);
    setPrescriptionData({
      medicine: '',
      dosage: '',
      times: [''],
      duration: '',
      notes: ''
    });
  };

  const addTimeSlot = () => {
    setPrescriptionData({
      ...prescriptionData,
      times: [...prescriptionData.times, '']
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...prescriptionData.times];
    newTimes[index] = value;
    setPrescriptionData({
      ...prescriptionData,
      times: newTimes
    });
  };

  const removeTimeSlot = (index: number) => {
    setPrescriptionData({
      ...prescriptionData,
      times: prescriptionData.times.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Appointments
        </h1>
        <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your appointments and track their progress
        </p>
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
              placeholder="Search appointments..."
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
            <Filter className={`absolute left-3 top-3 h-5 w-5 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
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

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onUpdateStatus={currentUser.role !== 'patient' ? handleUpdateStatus : undefined}
            onAddPrescription={currentUser.role === 'doctor' ? handleAddPrescription : undefined}
            showActions={currentUser.role !== 'patient'}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className={`text-center py-16 px-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Calendar size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No appointments found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {userAppointments.length === 0 
              ? 'You have no appointments scheduled yet.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Prescription
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={prescriptionData.medicine}
                    onChange={(e) => setPrescriptionData({...prescriptionData, medicine: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={prescriptionData.dosage}
                    onChange={(e) => setPrescriptionData({...prescriptionData, dosage: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Times
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Time
                    </button>
                  </div>
                  <div className="space-y-2">
                    {prescriptionData.times.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        {prescriptionData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Duration
                  </label>
                  <select
                    value={prescriptionData.duration}
                    onChange={(e) => setPrescriptionData({...prescriptionData, duration: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="7 days">7 days</option>
                    <option value="10 days">10 days</option>
                    <option value="14 days">14 days</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Additional instructions..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPrescription}
                  disabled={!prescriptionData.medicine || !prescriptionData.dosage || !prescriptionData.duration}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Pill className="mr-2 h-4 w-4" />
                  Add Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
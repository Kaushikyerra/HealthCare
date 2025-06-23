import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Pill, 
  MessageSquare, 
  Stethoscope, 
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Bell,
  Plus,
  TrendingUp,
  Heart,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { getCurrentUser } from '../../services/authService';

export const DoctorDashboard: React.FC = () => {
  const { 
    currentUser, 
    appointments, 
    users, 
    darkMode,
    caretakerRequests,
    fetchUsers,
    fetchUserAppointments,
    fetchCaretakerRequests,
    refreshAllData,
    loading,
    addPrescription,
    updateUser,
    setCurrentUser
  } = useStore();

  const [availableSlots, setAvailableSlots] = useState<{ day: string; slots: string[] }[]>(
    currentUser?.availableSlots || []
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Predefined time slots with more granular options
  const allTimeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00'
  ];

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchUserAppointments();
      fetchCaretakerRequests();
    }
  }, [currentUser, fetchUsers, fetchUserAppointments, fetchCaretakerRequests]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, refreshAllData]);

  // Filter appointments for today and upcoming
  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.doctorId === currentUser?.id && 
      (isToday(parseISO(apt.date)) || isTomorrow(parseISO(apt.date)))
    ).sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());
  }, [appointments, currentUser]);

  if (!currentUser) return null;

  // Get doctor's appointments
  const doctorAppointments = appointments.filter(apt => apt.doctorId === currentUser.id);
  const upcomingAppointments = doctorAppointments.filter(apt => apt.status === 'upcoming');
  const completedAppointments = doctorAppointments.filter(apt => apt.status === 'completed');
  const ongoingAppointments = doctorAppointments.filter(apt => apt.status === 'ongoing');

  // Get unique patients
  const uniquePatients = users.filter(user => 
    user.role === 'patient' && 
    doctorAppointments.some(apt => apt.patientId === user.id)
  );

  // Get recent prescriptions
  const recentPrescriptions = doctorAppointments
    .filter(apt => apt.prescriptions && apt.prescriptions.length > 0)
    .flatMap(apt => apt.prescriptions || [])
    .slice(0, 5);

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = doctorAppointments.filter(apt => apt.date === today);

  // Get new patient requests (patients who have appointments but no prescriptions yet)
  const newPatientRequests = doctorAppointments.filter(apt => 
    apt.status === 'upcoming' && 
    (!apt.prescriptions || apt.prescriptions.length === 0)
  );

  // Get patients with assigned caretakers
  const patientsWithCaretakers = uniquePatients.filter(patient => 
    (patient as any).caretakerId
  );

  // Get appointments that need prescriptions
  const appointmentsNeedingPrescriptions = doctorAppointments.filter(apt => 
    apt.status === 'completed' && 
    (!apt.prescriptions || apt.prescriptions.length === 0)
  );

  // Get recent activities
  const recentActivities = [
    ...doctorAppointments.map(apt => ({
      id: apt.id,
      type: 'appointment',
      title: `Appointment with ${users.find(u => u.id === apt.patientId)?.name || 'Patient'}`,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.notes || 'Medical consultation'
    })),
    ...recentPrescriptions.map(prescription => ({
      id: prescription.id,
      type: 'prescription',
      title: `Prescription: ${prescription.medicine}`,
      date: new Date().toISOString().split('T')[0],
      time: '',
      status: 'active',
      description: `${prescription.dosage} - ${prescription.duration}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Save available slots
  const handleSaveSlots = async () => {
    if (currentUser) {
      try {
        await updateUser(currentUser.id, { availableSlots });
        const updatedUser = await getCurrentUser();
        if (updatedUser) setCurrentUser(updatedUser);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to update available slots:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  };

  // Slot management with new UI
  const renderSlotManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedDay === day 
                  ? 'bg-emerald-500 text-white' 
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>

        {selectedDay && (
          <div className={`
            grid grid-cols-3 gap-3 p-6 rounded-xl
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
            {allTimeSlots.map((time) => {
              const isSelected = availableSlots.some(
                slot => slot.day.toLowerCase() === selectedDay.toLowerCase() && slot.slots.includes(time)
              );
              
              return (
                <div 
                  key={time} 
                  className="relative"
                  onClick={() => {
                    setAvailableSlots(prev => {
                      const dayIndex = prev.findIndex(slot => slot.day.toLowerCase() === selectedDay.toLowerCase());

                      if (dayIndex !== -1) {
                        const updatedSlots = [...prev];
                        const currentDaySlots = updatedSlots[dayIndex].slots;
                        
                        updatedSlots[dayIndex] = {
                          day: selectedDay,
                          slots: currentDaySlots.includes(time)
                            ? currentDaySlots.filter(s => s !== time)
                            : [...currentDaySlots, time]
                        };

                        return updatedSlots;
                      } else {
                        return [...prev, { day: selectedDay, slots: [time] }];
                      }
                    });
                  }}
                >
                  <div className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-emerald-500 text-white' 
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}>
                    {time}
                  </div>
                  {isSelected && (
                    <CheckCircle 
                      className="absolute top-0 right-0 text-white" 
                      size={16} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end flex-col items-end space-y-2">
          <button
            onClick={handleSaveSlots}
            className={`px-6 py-3 rounded-lg transition-colors ${
              darkMode
                ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            Save Slots for {selectedDay}
          </button>
          {saveStatus === 'success' && (
            <span className="text-green-600 text-sm mt-2">Slots saved successfully!</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm mt-2">Failed to save slots. Please try again.</span>
          )}
        </div>
      </div>
    );
  };

  // Render appointment status badge
  const getAppointmentStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
            <MoreHorizontal className="mr-1" size={14} /> Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
            <CheckCircle className="mr-1" size={14} /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
            <XCircle className="mr-1" size={14} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`p-8 rounded-xl ${
        darkMode ? 'bg-gradient-to-br from-emerald-900 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, Dr. {currentUser?.name.split(' ')[0]}!
            </h1>
            <p className="text-emerald-100 text-lg">
              Manage your appointments and availability
            </p>
          </div>
        </div>
      </div>

      {/* Today's and Upcoming Schedule */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Today's & Upcoming Schedule
        </h2>
        
        {todayAppointments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayAppointments.map((apt) => (
              <div 
                key={apt.id} 
                className={`
                  rounded-xl border p-6 
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {apt.patientName}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {apt.type === 'doctor' ? 'Medical Consultation' : 'Care Session'}
                    </p>
                  </div>
                  {getAppointmentStatusBadge(apt.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {format(parseISO(apt.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {apt.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`
            p-8 rounded-xl text-center 
            ${darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'}
          `}>
            <Calendar className={`mx-auto h-12 w-12 mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No appointments scheduled for today or tomorrow
            </p>
          </div>
        )}
      </div>

      {/* Slot Management */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Appointment Slots
        </h2>
        
        {renderSlotManagement()}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Patients
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {uniquePatients.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Today's Appointments
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {todaysAppointments.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                New Requests
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {newPatientRequests.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed Today
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {todaysAppointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* New Patient Requests */}
      {newPatientRequests.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            New Patient Requests
          </h2>
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {newPatientRequests.slice(0, 3).map((appointment) => {
                const patient = users.find(user => user.id === appointment.patientId);
                return (
                  <div key={appointment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-red-100">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient?.name || 'Patient'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {appointment.date} at {appointment.time} - {appointment.location}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            New patient consultation needed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          New
                        </span>
                        <Link
                          to={`/patients/${patient?.id}`}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <User className="h-4 w-4 text-blue-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/patients"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Patients
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View patient list
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/appointments"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Appointments
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage schedule
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/prescriptions"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Prescriptions
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create and manage
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/medical-records"
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Medical Records
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View patient history
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Today's Schedule
        </h2>
        <div className={`rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {todaysAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {todaysAppointments.map((appointment, index) => {
                const patient = users.find(user => user.id === appointment.patientId);
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          appointment.status === 'completed' ? 'bg-green-100' :
                          appointment.status === 'upcoming' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            appointment.status === 'completed' ? 'text-green-600' :
                            appointment.status === 'upcoming' ? 'text-blue-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient?.name || 'Patient'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {appointment.time} - {appointment.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'completed' && (
                          <button 
                            onClick={() => {
                              // Add prescription functionality
                              const prescriptionData = {
                                medicine: prompt('Enter medicine name:') || 'Sample Medicine',
                                dosage: prompt('Enter dosage:') || '10mg',
                                times: ['Morning', 'Evening'],
                                duration: prompt('Enter duration:') || '7 days',
                                notes: prompt('Enter notes:') || 'Take as prescribed'
                              };
                              addPrescription(appointment.id, prescriptionData);
                            }}
                            className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Add prescription"
                          >
                            <Pill className="h-4 w-4 text-purple-600" />
                          </button>
                        )}
                        {appointment.status === 'upcoming' && (
                          <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No appointments today
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Enjoy your free time or check upcoming appointments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Management */}
      {appointmentsNeedingPrescriptions.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Pending Prescriptions
          </h2>
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointmentsNeedingPrescriptions.slice(0, 3).map((appointment) => {
                const patient = users.find(user => user.id === appointment.patientId);
                return (
                  <div key={appointment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Pill className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient?.name || 'Patient'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {appointment.date} - {appointment.location}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Prescription needed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Pending
                        </span>
                        <button 
                          onClick={() => {
                            const prescriptionData = {
                              medicine: prompt('Enter medicine name:') || 'Sample Medicine',
                              dosage: prompt('Enter dosage:') || '10mg',
                              times: ['Morning', 'Evening'],
                              duration: prompt('Enter duration:') || '7 days',
                              notes: prompt('Enter notes:') || 'Take as prescribed'
                            };
                            addPrescription(appointment.id, prescriptionData);
                          }}
                          className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                          title="Add prescription"
                        >
                          <Plus className="h-4 w-4 text-purple-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Patients
        </h2>
        <div className={`rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {uniquePatients.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {uniquePatients.slice(0, 5).map((patient) => {
                const patientAppointments = doctorAppointments.filter(apt => apt.patientId === patient.id);
                const lastAppointment = patientAppointments[patientAppointments.length - 1];
                const assignedCaretaker = users.find(user => 
                  user.role === 'caretaker' && 
                  user.id === (patient as any).caretakerId
                );
                
                return (
                  <div key={patient.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {patientAppointments.length} appointments
                          </p>
                          {assignedCaretaker && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              ✓ Caretaker: {assignedCaretaker.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lastAppointment && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last: {lastAppointment.date}
                          </span>
                        )}
                        <Link
                          to={`/patients/${patient.id}`}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <User className="h-4 w-4 text-blue-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No patients yet
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Patients will appear here once they book appointments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
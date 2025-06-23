import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Pill, 
  MessageSquare, 
  Stethoscope, 
  UserPlus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Bell,
  Users,
  Heart,
  Phone,
  UserCheck
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
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
    loading
  } = useStore();

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

  if (!currentUser) return null;

  // Get patient's appointments
  const patientAppointments = appointments.filter(apt => apt.patientId === currentUser.id);
  const upcomingAppointments = patientAppointments.filter(apt => apt.status === 'upcoming');
  const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');
  const ongoingAppointments = patientAppointments.filter(apt => apt.status === 'ongoing');

  // Get connected doctors and caretakers
  const connectedDoctors = users.filter(user => 
    user.role === 'doctor' && 
    patientAppointments.some(apt => apt.doctorId === user.id)
  );

  const connectedCaretakers = users.filter(user => 
    user.role === 'caretaker' && 
    patientAppointments.some(apt => apt.caretakerId === user.id)
  );

  // Get assigned caretaker (from patient's caretakerId field)
  const assignedCaretaker = users.find(user => 
    user.role === 'caretaker' && 
    user.id === (currentUser as any).caretakerId
  );

  // Get recent prescriptions
  const recentPrescriptions = patientAppointments
    .filter(apt => apt.prescriptions && apt.prescriptions.length > 0)
    .flatMap(apt => apt.prescriptions || [])
    .slice(0, 3);

  // Get pending caretaker requests
  const pendingCaretakerRequests = caretakerRequests.filter(req => 
    req.patientId === currentUser.id && req.status === 'pending'
  );

  // Get accepted caretaker requests
  const acceptedCaretakerRequests = caretakerRequests.filter(req => 
    req.patientId === currentUser.id && req.status === 'accepted'
  );

  // Get recent activities (appointments + requests)
  const recentActivities = [
    ...patientAppointments.map(apt => ({
      id: apt.id,
      type: 'appointment',
      title: `${apt.type === 'doctor' ? 'Doctor' : 'Caretaker'} Appointment`,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.notes || `${apt.type === 'doctor' ? 'Medical consultation' : 'Care session'}`
    })),
    ...caretakerRequests.map(req => ({
      id: req.id,
      type: 'request',
      title: 'Caretaker Request',
      date: req.requestDate,
      time: '',
      status: req.status,
      description: req.message || `Request for ${req.careType || 'care services'}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`p-8 rounded-xl ${
        darkMode ? 'bg-gradient-to-br from-emerald-900 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-emerald-100 text-lg">
              Manage your health and connect with care professionals
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-100 text-sm">Real-time synchronized</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={refreshAllData}
              disabled={loading.users || loading.appointments || loading.caretakerRequests}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <Activity size={20} />
            </button>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Activity size={32} />
            </div>
          </div>
        </div>
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
                Total Appointments
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {patientAppointments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
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
                Upcoming
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {upcomingAppointments.length}
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
                Active Prescriptions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {recentPrescriptions.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Pill className="h-6 w-6 text-purple-600" />
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
                Pending Requests
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {pendingCaretakerRequests.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/book-doctor"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-emerald-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-emerald-500 hover:bg-gray-50'
            }`}
          >
            <Stethoscope className={`h-8 w-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-emerald-600`}>
              Book Doctor
            </span>
          </Link>

          <Link
            to="/medications"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-purple-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-gray-50'
            }`}
          >
            <Pill className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-purple-600`}>
              Medications
            </span>
          </Link>

          <Link
            to="/care-requests"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-green-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-green-500 hover:bg-gray-50'
            }`}
          >
            <Users className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-green-600`}>
              Care Requests
            </span>
          </Link>

          <Link
            to="/medical-records"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-blue-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-gray-50'
            }`}
          >
            <FileText className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-blue-600`}>
              Medical Records
            </span>
          </Link>

          <Link
            to="/chat-support"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-indigo-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-indigo-500 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-indigo-600`}>
              Chat Support
            </span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 space-y-3 text-center transition-all duration-300 group ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-pink-600 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:border-pink-500 hover:bg-gray-50'
            }`}
          >
            <User className={`h-8 w-8 ${darkMode ? 'text-pink-400' : 'text-pink-600'} group-hover:scale-110 transition-transform`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-pink-600`}>
              Profile
            </span>
          </Link>
        </div>
      </div>

      {/* Pending Caretaker Requests */}
      {pendingCaretakerRequests.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Pending Caretaker Requests
          </h2>
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingCaretakerRequests.map((request) => {
                const caretaker = users.find(user => user.id === request.caretakerId);
                return (
                  <div key={request.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <UserPlus className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Request for {caretaker?.name || 'Caretaker'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {request.careType || 'Care services'} • {request.requestDate}
                          </p>
                          {request.message && (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              "{request.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending
                        </span>
                        <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                          <Phone className="h-4 w-4 text-green-600" />
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

      {/* Care Team */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Care Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctors */}
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Your Doctors</span>
              </h3>
            </div>
            <div className="p-6">
              {connectedDoctors.length > 0 ? (
                <div className="space-y-4">
                  {connectedDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {doctor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {doctor.name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {doctor.specialization}
                        </p>
                      </div>
                      {doctor.verified && (
                        <div className="p-1 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Stethoscope className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No doctors connected yet
                  </p>
                  <Link
                    to="/book-doctor"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Book your first doctor
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Caretakers */}
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Heart className="h-5 w-5 text-green-600" />
                <span>Your Caretakers</span>
              </h3>
            </div>
            <div className="p-6">
              {assignedCaretaker ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {assignedCaretaker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {assignedCaretaker.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {assignedCaretaker.experience} experience
                      </p>
                      {acceptedCaretakerRequests.length > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ✓ Care request accepted
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {(assignedCaretaker as any).available && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {assignedCaretaker.verified && (
                        <div className="p-1 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : connectedCaretakers.length > 0 ? (
                <div className="space-y-4">
                  {connectedCaretakers.map((caretaker) => (
                    <div key={caretaker.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {caretaker.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {caretaker.name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {caretaker.experience} experience
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {(caretaker as any).available && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {caretaker.verified && (
                          <div className="p-1 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Heart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No caretakers connected yet
                  </p>
                  <Link
                    to="/request-caretaker"
                    className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block"
                  >
                    Request a caretaker
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h2>
        <div className={`rounded-xl border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'appointment' ? (
                          activity.status === 'completed' ? 'bg-green-100' :
                          activity.status === 'upcoming' ? 'bg-blue-100' :
                          'bg-orange-100'
                        ) : (
                          activity.status === 'pending' ? 'bg-orange-100' :
                          activity.status === 'accepted' ? 'bg-green-100' :
                          'bg-red-100'
                        )
                      }`}>
                        {activity.type === 'appointment' ? (
                          <Calendar className={`h-5 w-5 ${
                            activity.status === 'completed' ? 'text-green-600' :
                            activity.status === 'upcoming' ? 'text-blue-600' :
                            'text-orange-600'
                          }`} />
                        ) : (
                          <UserPlus className={`h-5 w-5 ${
                            activity.status === 'pending' ? 'text-orange-600' :
                            activity.status === 'accepted' ? 'text-green-600' :
                            'text-red-600'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.title}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.date} {activity.time && `at ${activity.time}`}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' || activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      activity.status === 'upcoming' || activity.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No recent activity
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Start by booking your first appointment or requesting care
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Prescriptions */}
      {recentPrescriptions.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Active Prescriptions
          </h2>
          <div className={`rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Pill className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {prescription.medicine}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {prescription.dosage} • {prescription.duration}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Take: {prescription.times.join(', ')}
                        </p>
                        {prescription.notes && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            Notes: {prescription.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Active
                      </span>
                      <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard; 